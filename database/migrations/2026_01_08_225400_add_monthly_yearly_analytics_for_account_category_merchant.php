<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Account Monthly
        Schema::create('analytics_account_monthly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->decimal('income', 10, 2)->default(0);
            $table->decimal('expense', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'account_id', 'year', 'month'], 'aam_user_account_year_month_unique');
            $table->index(['user_id', 'account_id', 'year', 'month']);
        });

        // Account Yearly
        Schema::create('analytics_account_yearly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->decimal('income', 10, 2)->default(0);
            $table->decimal('expense', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'account_id', 'year'], 'aay_user_account_year_unique');
            $table->index(['user_id', 'account_id', 'year']);
        });

        // Category Monthly
        Schema::create('analytics_category_monthly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->string('currency');
            $table->decimal('amount', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'category_id', 'year', 'month', 'currency'], 'acm_user_cat_year_month_curr_unique');
            $table->index(['user_id', 'category_id', 'year', 'month']);
        });

        // Category Yearly
        Schema::create('analytics_category_yearly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->string('currency');
            $table->decimal('amount', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'category_id', 'year', 'currency'], 'acy_user_cat_year_curr_unique');
            $table->index(['user_id', 'category_id', 'year']);
        });

        // Merchant Monthly
        Schema::create('analytics_merchant_monthly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->string('currency');
            $table->decimal('amount', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'merchant_id', 'year', 'month', 'currency'], 'amm_user_merch_year_month_curr_unique');
            $table->index(['user_id', 'merchant_id', 'year', 'month']);
        });

        // Merchant Yearly
        Schema::create('analytics_merchant_yearly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->string('currency');
            $table->decimal('amount', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'merchant_id', 'year', 'currency'], 'amy_user_merch_year_curr_unique');
            $table->index(['user_id', 'merchant_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_merchant_yearly');
        Schema::dropIfExists('analytics_merchant_monthly');
        Schema::dropIfExists('analytics_category_yearly');
        Schema::dropIfExists('analytics_category_monthly');
        Schema::dropIfExists('analytics_account_yearly');
        Schema::dropIfExists('analytics_account_monthly');
    }
};
