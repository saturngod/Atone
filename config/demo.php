<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Allow Demo Setup
    |--------------------------------------------------------------------------
    |
    | This option controls whether the demo data generation command is allowed
    | to run. Set to true in demo/staging environments where you want to seed
    | fake transaction data. Keep this false in production environments.
    |
    */

    'allow_demo_setup' => filter_var(env('ALLOW_DEMO_SETUP', false), FILTER_VALIDATE_BOOLEAN),

];
