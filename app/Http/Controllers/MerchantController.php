<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\MerchantStoreRequest;
use App\Http\Requests\MerchantUpdateRequest;
use App\Models\Merchant;
use App\Services\MerchantService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use InvalidArgumentException;

class MerchantController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private MerchantService $merchantService,
    ) {}

    public function index(Request $request)
    {
        return Inertia::render('Merchants/Index', [
            'merchants' => $this->merchantService->getMerchantsForUser($request->user()),
        ]);
    }

    public function store(MerchantStoreRequest $request)
    {
        $this->merchantService->createMerchant($request->user(), $request->validated());

        return back()->with('success', 'Merchant created successfully.');
    }

    public function update(MerchantUpdateRequest $request, Merchant $merchant)
    {
        $this->authorize('update', $merchant);
        $this->merchantService->updateMerchant($merchant, $request->validated());

        return back()->with('success', 'Merchant updated successfully.');
    }

    public function destroy(Merchant $merchant)
    {
        $this->authorize('delete', $merchant);

        try {
            $this->merchantService->deleteMerchant($merchant);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Merchant deleted successfully.');
    }
}
