<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('income', 10, 2)->default(0);
            $table->decimal('expense', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'date']);
            $table->index(['user_id', 'date']);
        });

        Schema::create('analytics_monthly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->integer('month');
            $table->decimal('income', 10, 2)->default(0);
            $table->decimal('expense', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'year', 'month']);
            $table->index(['user_id', 'year', 'month']);
        });

        Schema::create('analytics_yearly', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('year');
            $table->decimal('income', 10, 2)->default(0);
            $table->decimal('expense', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'year']);
            $table->index(['user_id', 'year']);
        });

        Schema::create('analytics_account_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('income', 10, 2)->default(0);
            $table->decimal('expense', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'account_id', 'date']);
            $table->index(['user_id', 'account_id', 'date']);
        });

        Schema::create('analytics_category_daily', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->decimal('amount', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'category_id', 'date']);
            $table->index(['user_id', 'category_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_category_daily');
        Schema::dropIfExists('analytics_account_daily');
        Schema::dropIfExists('analytics_yearly');
        Schema::dropIfExists('analytics_monthly');
        Schema::dropIfExists('analytics_daily');
    }
};
