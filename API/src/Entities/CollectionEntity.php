<?php

namespace Entities;
use Abstract\AbstractEntity;

class CollectionEntity extends AbstractEntity {
    private string $game = "";
    private string $user = "";
    private string $category = "";

    function format(): array
    {
        return [];
    }

    function validate(): array
    {
        return [];
    }

    function encode(): array
    {
        return [
            "game" => json_decode($this->game),
            "user" => json_decode($this->user),
            "category" => json_decode($this->category)
        ];
    }

    // Get/Set game
    public function getGame(): int { return $this->game; }
    public function setGame(int $value) { $this->game = $value; }

    // Get/Set user
    public function getUser(): string { return $this->user; }
    public function setUser(string $value) { $this->user = $value; }

    // Get/Set category
    public function getCategory(): string { return $this->category; }
    public function setCategory(string $value) { $this->category = $value; }
}