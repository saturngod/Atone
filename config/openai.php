<?php

return [
    'model' => env('OPENAI_MODEL', 'gpt-4o'),
    'api_key' => env('OPENAI_API_KEY'),
    'url' => env('OPENAI_URL', 'https://api.openai.com/v1'),
];
