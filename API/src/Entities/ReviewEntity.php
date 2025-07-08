<?php

namespace Entities;
use Abstract\AbstractEntity;

class ReviewEntity extends AbstractEntity {
    private int $id = 0;
    private string $game = "";
    private string $user = "";
    private string $platform = "";
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
        if(empty($this->platform)) {
            $errors['platform'] = "Please select a platform";
        }

        // Rating
        if($this->rating <= 0 ) {
            $errors['rating'] = "Please select a rating";
        }

        // Content
        if (empty($this->content)) {
            $errors['content'] = "Please write a review";
        }

        return $errors;
    }

    function encode(): array {
        return [
            "ID" => $this->id,
            "game" => json_decode($this->game),
            "user" => json_decode($this->user),
            "platform" => json_decode($this->platform),
            "rating" => $this->rating,
            "content" => $this->content,
            "createdAt" => $this->createdAt,
        ];
    }

    // Get/Set id
    public function getID(): int { return $this->id; }
    public function setID(int $newID) { $this->id = $newID; }

    // Get/Set game
    public function getGame(): string { return $this->game; }
    public function setGame(string $newGame) { $this->game = $newGame; }

    // Get/Set user
    public function getUser(): string { return $this->user; }
    public function setUser(string $newUser) { $this->user = $newUser; }

    // Get/Set platform
    public function getPlatform(): string { return $this->platform; }
    public function setPlatform(string $newPlatform) { $this->platform = $newPlatform; }

    // Get/Set rating
    public function getRating(): float { return $this->rating; }
    public function setRating(float $newRating) { $this->rating = $newRating; }
    
    // Get/Set content
    public function getContent(): string { return $this->content; }
    public function setContent(string $newContent) {
        $newContent = trim($newContent);
        $this->content = $newContent;
    }
    
    // Get/Set createdAt
    public function getCreatedAt(): int { return $this->createdAt; }
    public function setCreatedAt(int $newCreatedAt) { $this->createdAt = $newCreatedAt; }
}