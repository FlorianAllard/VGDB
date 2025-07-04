<?php

namespace Entities;
use Abstract\AbstractEntity;

class ReviewEntity extends AbstractEntity {
    private int $id = 0;
    private int $game = 0;
    private int $user = 0;
    private int $platform = 0;
    private float $rating = 0.0;
    private string $content = "";
    private int $createdAt;

    private function __construct() {
        $this->createdAt = time();
    }

    function format(): array {
        return [];
    }

    function validate(): array {
        $errors = [];

        // Platform
        // Rating
        // Content

        return $errors;
    }

    function encode(): array {
        return [
            "ID" => $this->id,
            "game" => json_decode($this->game),
            "userID" => json_decode($this->user),
            "platformID" => json_decode($this->platform),
            "rating" => $this->rating,
            "content" => $this->content,
            "content" => $this->createdAt,
        ];
    }
}