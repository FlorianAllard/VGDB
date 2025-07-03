<?php 

namespace Abstract;

abstract class AbstractEntity {
    abstract public function format(): array;
    abstract public function validate(): array;
    abstract public function stringify(): array;

    protected function cleanString(string $data): string {
        $data = trim($data);
        $data = stripslashes($data);
        return htmlspecialchars($data);
    }
}