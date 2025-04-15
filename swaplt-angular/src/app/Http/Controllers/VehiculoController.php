<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    public function getUserVehicles()
    {
        try {
            \Log::info('Iniciando getUserVehicles');
            
            // Verificar si el token es válido
            if (!auth()->check()) {
                \Log::error('Token inválido o expirado');
                return response()->json([
                    'success' => false,
                    'message' => 'Token inválido o expirado'
                ], 401);
            }

            // Obtener el usuario autenticado
            $user = auth()->user();
            
            if (!$user) {
                \Log::error('Usuario no encontrado');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            \Log::info('Usuario encontrado: ' . $user->id);

            // Verificar si el modelo Vehiculo existe
            if (!class_exists('App\\Models\\Vehiculo')) {
                \Log::error('Modelo Vehiculo no encontrado');
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno del servidor: Modelo no encontrado'
                ], 500);
            }

            // Obtener los vehículos del usuario
            $vehiculos = \App\Models\Vehiculo::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            \Log::info('Vehículos encontrados: ' . $vehiculos->count());

            return response()->json([
                'success' => true,
                'data' => $vehiculos,
                'message' => 'Vehículos obtenidos exitosamente'
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Error en getUserVehicles: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los vehículos: ' . $e->getMessage()
            ], 500);
        }
    }
} 