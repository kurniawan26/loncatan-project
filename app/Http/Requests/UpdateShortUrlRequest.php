<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShortUrlRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $shortUrl = $this->route('shortUrl');
        return [
            'original_url' => ['nullable', 'url', 'max:2048'],
            'short_code' => ['nullable', 'string', 'alpha_dash', 'min:3', 'max:16', "unique:short_urls,short_code,{$shortUrl->id}"],
            'expires_at' => ['nullable', 'date', 'after:now'],
            'is_active' => ['nullable', 'boolean']
        ];
    }
}
