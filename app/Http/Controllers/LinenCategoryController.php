<?php

namespace App\Http\Controllers;

use App\Models\LinenCategory;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LinenCategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = LinenCategory::withCount('linens');

        // Search by name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        $categories = $query->paginate(10)->withQueryString();

        return Inertia::render('Master/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:linen_categories,name',
        ]);

        $category = LinenCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        ActivityLogger::logCreated('LinenCategory', $category->id, $category->name);

        return redirect()->route('master.categories.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, LinenCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:linen_categories,name,' . $category->id,
        ]);

        $oldName = $category->name;

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        ActivityLogger::logUpdated('LinenCategory', $category->id, $category->name, [
            'old' => ['name' => $oldName],
            'new' => ['name' => $validated['name']],
        ]);

        return redirect()->route('master.categories.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(LinenCategory $category)
    {
        // Check if category has linens
        if ($category->linens()->count() > 0) {
            ActivityLogger::logFailed('delete_category', 'Cannot delete category with existing linens');
            return redirect()->route('master.categories.index')
                ->with('error', 'Tidak dapat menghapus kategori yang masih memiliki linen.');
        }

        $categoryName = $category->name;
        $categoryId = $category->id;

        $category->delete();

        ActivityLogger::logDeleted('LinenCategory', $categoryId, $categoryName);

        return redirect()->route('master.categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}
