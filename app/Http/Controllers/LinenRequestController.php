<?php

namespace App\Http\Controllers;

use App\Models\Linen;
use App\Models\LinenRequest;
use App\Models\LinenRequestItem;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LinenRequestController extends Controller
{
    /**
     * Store a new linen request.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.linen_id' => 'required|exists:linens,id',
            'items.*.qty' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            $linenRequest = LinenRequest::create([
                'user_id' => auth()->id(),
                'notes' => $validated['notes'] ?? null,
                'status' => LinenRequest::STATUS_PENDING,
            ]);

            foreach ($validated['items'] as $item) {
                LinenRequestItem::create([
                    'linen_request_id' => $linenRequest->id,
                    'linen_id' => $item['linen_id'],
                    'qty' => $item['qty'],
                ]);
            }

            // Mark as sent immediately (since external system)
            $linenRequest->update([
                'status' => LinenRequest::STATUS_SENT,
                'sent_at' => now(),
            ]);

            DB::commit();

            ActivityLogger::logCreated('LinenRequest', $linenRequest->id, 
                "Request linen: {$linenRequest->request_code}");

            return redirect()->back()
                ->with('success', "Request linen {$linenRequest->request_code} berhasil dikirim.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->back()
                ->with('error', 'Gagal mengirim request: ' . $e->getMessage());
        }
    }

    /**
     * Get all linens for the request form.
     */
    public function getLinens()
    {
        $linens = Linen::with('category')
            ->orderBy('name')
            ->get()
            ->map(function ($linen) {
                return [
                    'id' => $linen->id,
                    'name' => $linen->name,
                    'sku_code' => $linen->sku_code,
                    'category_name' => $linen->category?->name ?? '-',
                ];
            });

        return response()->json($linens);
    }

    /**
     * Get request history.
     */
    public function index(Request $request)
    {
        $query = LinenRequest::with(['user', 'items.linen'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $requests = $query->paginate(10)->withQueryString();

        return Inertia::render('Produksi/Request/Index', [
            'requests' => $requests,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }
}
