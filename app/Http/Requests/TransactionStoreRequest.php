<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransactionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required', 'exists:accounts,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'category_name' => ['nullable', 'string', 'max:255'],
            'merchant_name' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric'],
            'description' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'account_id.required' => 'Please select an account.',
            'category_id.*' => 'Invalid category selected.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if (empty($this->category_id) && empty($this->category_name)) {
                $validator->errors()->add(
                    'category_name',
                    'Please select or create a category.',
                );
            }
        });
    }
}
