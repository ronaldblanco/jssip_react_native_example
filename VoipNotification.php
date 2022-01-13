<?php

/**
 * Created by PhpStorm.
 * User: lsm
 * Date: 6/20/18
 * Time: 10:30 AM
 */

namespace App\Classes\VoipNotification;

//use GuzzleHttp\Client;
use Exception;
use Carbon\Carbon;
use Pushok\Client;
use Pushok\Payload\Alert;

use Pushok\AuthProvider\token;
use Illuminate\Support\Facades\Http;
use Pushok\Payload as CustomPayload;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Notifications\Notification;
use NotificationChannels\Apn\ApnVoipChannel;
use NotificationChannels\Apn\ApnVoipMessage;
use Pushok\Notification as CustomNotification;

class VoipNotification extends Notification
{
    public function via($notifiable)
    {
        return [ApnVoipChannel::class];
    }

    public function toApnVoip($notifiable, $count = null, $extraInfo = null)
    {

        $locationCert = '../storage/voip-push-certificates.p8';

        $options = Config::get('broadcasting.connections.apn');
        $options['private_key_path'] = $locationCert;

        $custom = $notifiable->routeNotificationForApnVoip();

        $cacheToken = Cache::get('voip_token');
        //dd($cacheToken);
        if ($cacheToken == null) {
            $tokenAlone = \Pushok\AuthProvider\Token::create($options);
            $token = $tokenAlone->get();
            Cache::put('voip_token', $token, Carbon::now()->addMinute(55));
            $cacheToken = $token;
        }
        
        $token = $cacheToken;

        //dd($token);
        //$clientCustom = ClientFactory::
        //$notification = ApnVoipMessage::create(null,null,$custom,null)->title('voip test')
        //->body("voip test body!")->badge($count?$count:1)->via($customClient);

        $payload = [
            "aps" => [
                //"alert" => "Incoming Call from ".$extraInfo['callerName'],
                "alert" => "Incoming Call",
                "sound" => "default",
                "apns-push-type" => "voip",
                "apns-priority" => 10,
                //"badge" => $count ? $count : 1,
                //"handle" => $extraInfo['caller'],
                //"callerName" => $extraInfo['callerName']
            ],
            "badge" => $count ? $count : 1,
            "handle" => $extraInfo['caller'],
            "callerName" => $extraInfo['callerName']
        ];
        $dataString = json_encode($payload);

        $env = Config::get('broadcasting.connections.apn.production');
        $serverNotification = $env == true ? "api.push.apple.com" : "api.sandbox.push.apple.com";

        $headers = [
            'Authorization: bearer ' . $token,
            //'Content-Type: application/json',
            'apns-push-type: voip',
            'apns-topic: ' . Config::get('broadcasting.connections.apn.app_bundle_id') . '.voip',

            //"apns-priority" => 10,
            "apns-expiration" => 0,
            //"host" => $serverNotification
        ];

        //dd($headers);

        $ch = curl_init();
                
        //curl_setopt($ch, CURLOPT_URL, 'https://'.$serverNotification.'/3/device/'.$custom[0]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataString);

        $arrResponse = [];
        foreach ($custom as $deviceToken) {
            curl_setopt($ch, CURLOPT_URL, 'https://' . $serverNotification . '/3/device/' . $deviceToken);
            //dd($payload);
            try {
                $response = curl_exec($ch);
                array_push($arrResponse, ["device_token" => $deviceToken]);
                array_push($arrResponse, $response);
            } catch (Exception $e) {
            }
        }

        array_push($arrResponse, ["server_token" => $token]);
        return $arrResponse;
        //return Config::get('broadcasting.connections.apn.app_bundle_id');

    }

    public function toApnVoipCustom($notifiable)
    {
        /*$customClient = new Client(AuthProvider\Token::create($options));

        return ApnMessage::create()
            ->title('Account approved')
            ->body("Your {$notifiable->service} account was approved!")
            ->via($customClient);*/
    }

    public function toApnVoipBackground($notifiable, $count = null, $extraInfo = null)
    {

        $locationCert = '../storage/voip-push-certificates.p8';

        $options = Config::get('broadcasting.connections.apn');
        $options['private_key_path'] = $locationCert;

        $custom = $notifiable->routeNotificationForApnVoip();

        $cacheToken = Cache::get('voip_token');
        //dd($cacheToken);
        if ($cacheToken == null) {
            $tokenAlone = \Pushok\AuthProvider\Token::create($options);
            $token = $tokenAlone->get();
            Cache::put('voip_token', $token, Carbon::now()->addMinute(55));
            $cacheToken = $token;
        }
        
        $token = $cacheToken;

        //dd($token);
        //$clientCustom = ClientFactory::
        //$notification = ApnVoipMessage::create(null,null,$custom,null)->title('voip test')
        //->body("voip test body!")->badge($count?$count:1)->via($customClient);

        $payload = [
            "aps" => [
                "content-available" => 1,
                //"alert" => "voip test",
                //"sound" => "default",
                "apns-push-type" => "background",
                "apns-priority" => 10,
                //"badge" => $count ? $count : 1,
                //"handle" => $extraInfo['caller'],
                //"callerName" => $extraInfo['callerName']
            ],
            "action" => "handup_call"
        ];
        $dataString = json_encode($payload);

        $headers = [
            'Authorization: bearer ' . $token,
            //'Content-Type: application/json',
            'apns-push-type: background',
            'apns-topic: ' . Config::get('broadcasting.connections.apn.app_bundle_id'),
        ];

        //dd($headers);

        $ch = curl_init();

        $env = Config::get('broadcasting.connections.apn.production');
        $serverNotification = $env == true ? "api.push.apple.com" : "api.sandbox.push.apple.com";

        //curl_setopt($ch, CURLOPT_URL, 'https://'.$serverNotification.'/3/device/'.$custom[0]);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $dataString);

        $arrResponse = [];
        foreach ($custom as $deviceToken) {
            curl_setopt($ch, CURLOPT_URL, 'https://' . $serverNotification . '/3/device/' . $deviceToken);
            //dd($payload);
            try {
                $response = curl_exec($ch);
                array_push($arrResponse, $response);
            } catch (Exception $e) {
            }
        }

        return $arrResponse;
        //return Config::get('broadcasting.connections.apn.app_bundle_id');

    }
}
