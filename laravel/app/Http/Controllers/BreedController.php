<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


class BreedController extends Controller
{

    private function traducir($texto, $target = 'es')
    {
        try {
            $client = new \GuzzleHttp\Client();
            $response = $client->post('http://127.0.0.1:5000/translate', [
                'form_params' => [
                    'q' => $texto,
                    'source' => 'en',
                    'target' => $target,
                    'format' => 'text',
                ],
                'timeout' => 10,
            ]);

            $body = $response->getBody()->getContents();
            \Log::info('🧾 Respuesta de LibreTranslate: ' . $body);

            $data = json_decode($body, true);
            return $data['translatedText'] ?? $texto;

        } catch (\Exception $e) {
            \Log::error('Error traduciendo "' . $texto . '": ' . $e->getMessage());
            return $texto;
        }
    }

    private function traducirTemperamento($texto)
    {
        $partes = explode(',', $texto);
        $traducidas = [];

        // Diccionario de corrección manual
        $correcciones = [
            'Gentle' => 'Amable',
            'Sensitive' => 'Sensible',
            'Lively' => 'Vivaz',
            'Affectionate' => 'Cariñoso',
            'Playful' => 'Juguetón',
            'Easy Going' => 'Tranquilo',
            'Curious' => 'Curioso',
            'Social' => 'Sociable',
            'Active' => 'Activo',
            'Calm' => 'Calmado',
            'Energetic' => 'Energético',
            'Loyal' => 'Leal',
            'Sensible' => 'Sensato',
            'Agile' => 'Ágil',
            'Fun-loving' => 'Amante de la diversión',
            'Friendly' => 'Amigable',
            'Demanding' => 'Demandante',
            'Dependent' => 'Dependiente',
            'Patient' => 'Paciente',
            'Mischievous' => 'Travieso',
            'affectionate' => 'Cariñoso',
            'Loving' => 'Amoroso',
            'Quiet' => 'Tranquilo',
            'Peaceful' => 'Pacífico',
            'Clever' => 'Listo',
            'Devoted' => 'Dedicado',
            'Talkative' => 'Hablador',
            'Warm' => 'Cálido',
            'Expressive' => 'Expresivo',
            'Trainable' => 'Entrenable',
            'Shy' => 'Tímido',
            'Sedate' => 'Sosegado',
            'Easygoing' => 'Tranquilo',
            'Outgoing' => 'Extrovertido',
            'Adventurous' => 'Aventurero',
            'Sweet-tempered' => 'Temperamento dulce',
            'Tenacious' => 'Tenaz',


        ];

        foreach ($partes as $parte) {
            $parteLimpia = trim($parte);

            // Si hay corrección definida, usar directamente
            if (isset($correcciones[$parteLimpia])) {
                $traducidas[] = $correcciones[$parteLimpia];
            } else {
                $traducida = $this->traducir($parteLimpia);
                $traducidas[] = ucfirst($traducida);
            }
        }

        return implode(', ', $traducidas);
    }





    private function reemplazarFrasesDeRaza($texto, $nombreRaza)
    {
        $pattern = '/\b(the)\s+' . preg_quote($nombreRaza, '/') . '\s+cat(s?)\b/i';

        return preg_replace_callback($pattern, function ($matches) use ($nombreRaza) {
            $the = $matches[1]; // "The" o "the"
            $plural = $matches[2] === 's';

            if ($the === 'The') {
                return $plural ? "Los gatos $nombreRaza" : "El gato $nombreRaza";
            } else { // "the"
                return $plural ? "de los gatos $nombreRaza" : "del gato $nombreRaza";
            }
        }, $texto);
    }

    private function traducirDescripcion($texto, $nombreRaza, $target = 'es')
    {
        try {

            // Paso 1: Proteger el nombre de la raza para que no se traduzca
            $marcador = 'NOMBRERAZA';
            $pattern = '/\b' . preg_quote($nombreRaza, '/') . '\b/i';
            $textoProtegido = preg_replace($pattern, $marcador, $texto);

            // Paso 2: Reemplazar frases con el marcador protegido
            $textoModificado  = $this->reemplazarFrasesDeRaza($textoProtegido, $nombreRaza);

            // Paso 3: Traducir con LibreTranslate
            $client = new \GuzzleHttp\Client();
            $response = $client->post('http://127.0.0.1:5000/translate', [
                'form_params' => [
                    'q' => $textoModificado,
                    'source' => 'en',
                    'target' => $target,
                    'format' => 'text',
                ],
                'timeout' => 10,
            ]);

            $body = $response->getBody()->getContents();
            $data = json_decode($body, true);
            

            // Paso 4: Restaurar nombre de raza
             $traduccionFinal = str_replace($marcador, $nombreRaza, $data['translatedText'] ?? $texto);


            return $traduccionFinal;

        } catch (\Exception $e) {
            \Log::error('❌ Error traduciendo descripción: ' . $e->getMessage());
            return $texto;
        }
    }



    public function guardarRazas(Request $request)
    {
        $razas = $request->input('data');
        if (!$razas) {
            return response()->json(['error' => 'No se enviaron datos'], 400);
        }

        $razasTraducidas = array_map(function ($breed) {
            $nombreRaza = $breed['name'] ?? '';
            $descripcionOriginal = $breed['description'] ?? '';

            $descripcionTraducida = $this->traducirDescripcion($descripcionOriginal, $nombreRaza);

            return [
                ...$breed,
                'id' => $breed['id'],
                'name' => $breed['name'],
                'origin' => isset($breed['origin']) ? $this->traducir($breed['origin']) : '',
                'description' => $descripcionTraducida,
                'temperament' => isset($breed['temperament'])
                    ? $this->traducirTemperamento($breed['temperament'])
                    : '',
            ];
        }, $razas);



        Storage::disk('public')->put('breeds-es.json', json_encode($razasTraducidas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->json(['success' => true]);
    }
}
