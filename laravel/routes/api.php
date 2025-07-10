<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BreedController;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    $request->user()->currentAccessToken()->delete();

    return response()->json(['message' => 'Logged out']);
});

Route::post('/guardar-razas', [BreedController::class, 'guardarRazas']);

Route::get('/razas-es', function () {
    if (!Storage::disk('public')->exists('breeds-es.json')) {
        return response()->json(['error' => 'Archivo no encontrado'], 404);
    }
    
    $json = Storage::disk('public')->get('breeds-es.json');
    return response()->json(json_decode($json));
});



