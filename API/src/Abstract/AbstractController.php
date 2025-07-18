<?php

namespace Abstract;

require_once __DIR__."/../services/_csrf.php";

abstract class AbstractController {
    protected function setCSRF(int $time = 0): void {
        setCSRF($time);
    }

    protected function isCSRFValid(): bool {
        return isCSRFValid();
    }

    protected function verifyReCaptcha($recaptchaCode)
    {
        $postdata = http_build_query(["secret" => "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe", "response" => $recaptchaCode]);
        $opts = [
            'http' =>
            [
                'method'  => 'POST',
                'header'  => 'Content-type: application/x-www-form-urlencoded',
                'content' => $postdata
            ]
        ];
        $context  = stream_context_create($opts);
        $result = file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
        $check = json_decode($result);
        return $check->success;
    }
}