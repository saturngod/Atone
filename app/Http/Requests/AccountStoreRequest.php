<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AccountStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'currency_code' => ['required', 'string', Rule::in(config('finance.currencies'))],
        ];
    }

    public function messages(): array
    {
        return [
            'color.regex' => 'The color must be a valid hex code (e.g., #3b82f6).',
        ];
    }
}
