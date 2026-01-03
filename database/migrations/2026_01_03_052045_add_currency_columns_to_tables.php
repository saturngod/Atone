<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('currency_code', 3)->default('USD')->after('email');
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->string('currency_code', 3)->default('USD')->after('color');
        });

        // Update Analytics Tables
        // For these tables, we must drop the existing unique index and create a new one including currency

        Schema::table('analytics_daily', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'date']);
            $table->string('currency', 3)->default('USD')->after('date');
            $table->unique(['user_id', 'date', 'currency'], 'unique_daily_user_date_curr');
        });

        Schema::table('analytics_monthly', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'year', 'month']);
            $table->string('currency', 3)->default('USD')->after('month');
            $table->unique(['user_id', 'year', 'month', 'currency'], 'unique_monthly_user_ym_curr');
        });

        Schema::table('analytics_yearly', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'year']);
            $table->string('currency', 3)->default('USD')->after('year');
            $table->unique(['user_id', 'year', 'currency'], 'unique_yearly_user_y_curr');
        });

        Schema::table('analytics_category_daily', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'category_id', 'date']);
            $table->string('currency', 3)->default('USD')->after('date');
            $table->unique(['user_id', 'category_id', 'date', 'currency'], 'unique_cat_daily_user_cat_date_curr');
        });

        // For accounts, unique constraint remains valid (account implies currency), just add the column for easier querying
        Schema::table('analytics_account_daily', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('currency_code');
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn('currency_code');
        });

        Schema::table('analytics_daily', function (Blueprint $table) {
            $table->dropUnique('unique_daily_user_date_curr');
            $table->dropColumn('currency');
            $table->unique(['user_id', 'date']);
        });

        Schema::table('analytics_monthly', function (Blueprint $table) {
            $table->dropUnique('unique_monthly_user_ym_curr');
            $table->dropColumn('currency');
            $table->unique(['user_id', 'year', 'month']);
        });

        Schema::table('analytics_yearly', function (Blueprint $table) {
            $table->dropUnique('unique_yearly_user_y_curr');
            $table->dropColumn('currency');
            $table->unique(['user_id', 'year']);
        });

        Schema::table('analytics_category_daily', function (Blueprint $table) {
            $table->dropUnique('unique_cat_daily_user_cat_date_curr');
            $table->dropColumn('currency');
            $table->unique(['user_id', 'category_id', 'date']);
        });

        Schema::table('analytics_account_daily', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
};
