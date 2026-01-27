<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomStock;
use App\Models\Linen;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $query = Room::withCount(['roomStocks', 'users']);

        // Search by name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Sorting
        $sortField = $request->get('sort', 'name');
        $sortDirection = $request->get('direction', 'asc');
        
        if (in_array($sortField, ['name', 'type', 'created_at'])) {
            $query->orderBy($sortField, $sortDirection);
        } else {
            $query->orderBy('name', $sortDirection);
        }

        $rooms = $query->paginate(10)->withQueryString();

        return Inertia::render('Master/Room/Index', [
            'rooms' => $rooms,
            'roomTypes' => Room::getTypes(),
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:rooms,name',
            'type' => 'required|string|in:WARD,ICU,OT,OFFICE',
        ]);

        $room = Room::create($validated);

        ActivityLogger::logCreated('Room', $room->id, $room->name);

        return redirect()->route('master.room.index')
            ->with('success', 'Ruangan berhasil ditambahkan.');
    }

    public function show(Room $room)
    {
        $room->load(['roomStocks.linen', 'users']);
        $linens = Linen::orderBy('name')->get();

        return Inertia::render('Master/Room/Show', [
            'room' => $room,
            'linens' => $linens,
        ]);
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:rooms,name,' . $room->id,
            'type' => 'required|string|in:WARD,ICU,OT,OFFICE',
        ]);

        $oldData = [
            'name' => $room->name,
            'type' => $room->type,
        ];

        $room->update($validated);

        ActivityLogger::logUpdated('Room', $room->id, $room->name, [
            'old' => $oldData,
            'new' => $validated,
        ]);

        return redirect()->route('master.room.index')
            ->with('success', 'Ruangan berhasil diperbarui.');
    }

    public function destroy(Room $room)
    {
        // Check if room has stocks
        if ($room->roomStocks()->count() > 0) {
            ActivityLogger::logFailed('delete_room', 'Cannot delete room with existing stock');
            return redirect()->route('master.room.index')
                ->with('error', 'Tidak dapat menghapus ruangan yang masih memiliki stok.');
        }

        // Check if room has assigned users
        if ($room->users()->count() > 0) {
            ActivityLogger::logFailed('delete_room', 'Cannot delete room with assigned users');
            return redirect()->route('master.room.index')
                ->with('error', 'Tidak dapat menghapus ruangan yang masih memiliki user terkait.');
        }

        $roomName = $room->name;
        $roomId = $room->id;

        $room->delete();

        ActivityLogger::logDeleted('Room', $roomId, $roomName);

        return redirect()->route('master.room.index')
            ->with('success', 'Ruangan berhasil dihapus.');
    }

    /**
     * Update par stock for a specific linen in a room.
     */
    public function updateParStock(Request $request, Room $room)
    {
        $validated = $request->validate([
            'linen_id' => 'required|exists:linens,id',
            'par_stock' => 'required|integer|min:0',
        ]);

        $roomStock = RoomStock::updateOrCreate(
            [
                'room_id' => $room->id,
                'linen_id' => $validated['linen_id'],
            ],
            [
                'par_stock' => $validated['par_stock'],
            ]
        );

        $linen = Linen::find($validated['linen_id']);

        ActivityLogger::log('par_stock_updated', 'RoomStock', $roomStock->id, 
            "Par stock for {$linen->name} in {$room->name} set to {$validated['par_stock']}");

        return redirect()->back()
            ->with('success', 'Par stock berhasil diperbarui.');
    }
}
