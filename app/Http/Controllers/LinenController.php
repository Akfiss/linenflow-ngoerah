<?php

namespace App\Http\Controllers;

use App\Models\Linen;
use App\Models\LinenCategory;
use App\Models\CentralStock;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LinenController extends Controller
{
    public function index(Request $request)
    {
        $query = Linen::with(['category', 'centralStock']);

        // Search by name or SKU
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku_code', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->where('linen_category_id', $request->category);
        }

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');
        
        if (in_array($sortField, ['name', 'sku_code', 'weight_gram', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('name', $sortDirection);
        }

        $linens = $query->paginate(10)->withQueryString();
        $categories = LinenCategory::orderBy('name')->get();

        return Inertia::render('Master/Linen/Index', [
            'linens' => $linens,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku_code' => 'required|string|max:50|unique:linens,sku_code',
            'linen_category_id' => 'required|exists:linen_categories,id',
            'weight_gram' => 'required|integer|min:0',
            'lifespan_cycles_estimate' => 'nullable|integer|min:1',
            'initial_stock' => 'nullable|integer|min:0',
        ]);

        $linen = Linen::create([
            'name' => $validated['name'],
            'sku_code' => $validated['sku_code'],
            'linen_category_id' => $validated['linen_category_id'],
            'weight_gram' => $validated['weight_gram'],
            'lifespan_cycles_estimate' => $validated['lifespan_cycles_estimate'] ?? 100,
        ]);

        // Create initial central stock if provided
        if (isset($validated['initial_stock']) && $validated['initial_stock'] > 0) {
            CentralStock::create([
                'linen_id' => $linen->id,
                'clean_qty' => $validated['initial_stock'],
                'dirty_qty' => 0,
                'washing_qty' => 0,
            ]);
        } else {
            // Create empty central stock record
            CentralStock::create([
                'linen_id' => $linen->id,
                'clean_qty' => 0,
                'dirty_qty' => 0,
                'washing_qty' => 0,
            ]);
        }

        ActivityLogger::logCreated('Linen', $linen->id, $linen->name);

        return redirect()->route('master.linen.index')
            ->with('success', 'Linen berhasil ditambahkan.');
    }

    public function show(Linen $linen)
    {
        $linen->load(['category', 'centralStock', 'roomStocks.room']);

        return Inertia::render('Master/Linen/Show', [
            'linen' => $linen,
        ]);
    }

    public function update(Request $request, Linen $linen)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku_code' => 'required|string|max:50|unique:linens,sku_code,' . $linen->id,
            'linen_category_id' => 'required|exists:linen_categories,id',
            'weight_gram' => 'required|integer|min:0',
            'lifespan_cycles_estimate' => 'nullable|integer|min:1',
        ]);

        $oldData = [
            'name' => $linen->name,
            'sku_code' => $linen->sku_code,
            'linen_category_id' => $linen->linen_category_id,
            'weight_gram' => $linen->weight_gram,
        ];

        $linen->update([
            'name' => $validated['name'],
            'sku_code' => $validated['sku_code'],
            'linen_category_id' => $validated['linen_category_id'],
            'weight_gram' => $validated['weight_gram'],
            'lifespan_cycles_estimate' => $validated['lifespan_cycles_estimate'] ?? $linen->lifespan_cycles_estimate,
        ]);

        ActivityLogger::logUpdated('Linen', $linen->id, $linen->name, [
            'old' => $oldData,
            'new' => $validated,
        ]);

        return redirect()->route('master.linen.index')
            ->with('success', 'Linen berhasil diperbarui.');
    }

    public function destroy(Linen $linen)
    {
        // Check if linen has stock
        $centralStock = $linen->centralStock;
        if ($centralStock && ($centralStock->clean_qty > 0 || $centralStock->dirty_qty > 0 || $centralStock->washing_qty > 0)) {
            ActivityLogger::logFailed('delete_linen', 'Cannot delete linen with existing stock');
            return redirect()->route('master.linen.index')
                ->with('error', 'Tidak dapat menghapus linen yang masih memiliki stok.');
        }

        // Check if linen has room stocks
        if ($linen->roomStocks()->sum('current_qty') > 0) {
            ActivityLogger::logFailed('delete_linen', 'Cannot delete linen with room stock');
            return redirect()->route('master.linen.index')
                ->with('error', 'Tidak dapat menghapus linen yang masih ada di ruangan.');
        }

        $linenName = $linen->name;
        $linenId = $linen->id;

        // Soft delete
        $linen->delete();

        ActivityLogger::logDeleted('Linen', $linenId, $linenName);

        return redirect()->route('master.linen.index')
            ->with('success', 'Linen berhasil dihapus.');
    }
}
