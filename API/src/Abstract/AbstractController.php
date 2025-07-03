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
}