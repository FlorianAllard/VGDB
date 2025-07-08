<?php

namespace Entities;

use Abstract\AbstractEntity;

class GameEntity extends AbstractEntity {
    private int $id = 0;
    private string $name = "";
    private int $officialReleaseDate = 0;
    private string $summary = "";
    private string $premise = "";

    private string $covers = "";
    private string $genres = "";
    private string $platforms = "";
    private string $modes = "";
    private string $perspectives = "";
    private string $themes = "";
    private string $involvedCompanies = "";
    private string $engines = "";
    private string $series = "";
    private string $franchises = "";
    private string $supportedLanguages = "";
    private string $ageRatings = "";
    private string $regionalReleases = "";
    private string $media = "";
    private string $websites = "";
    private string $timesToBeat = "";

    private int $createdAt = 0;
    private int $updatedAt = 0;

    public function __construct() {
        $this->createdAt = time();
    }

    public function format(): array {
        return [];
    }

    public function encode(): array {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "officialReleaseDate" => $this->officialReleaseDate,
            "summary" => $this->summary,
            "premise" => $this->premise,

            "covers" => json_decode($this->covers),
            "genres" => json_decode($this->genres),
            "platforms" => json_decode($this->platforms),
            "modes" => json_decode($this->modes),
            "perspectives" => json_decode($this->perspectives),
            "themes" => json_decode($this->themes),
            "involvedCompanies" => json_decode($this->involvedCompanies),
            "engines" => json_decode($this->engines),
            "series" => json_decode($this->series),
            "franchises" => json_decode($this->franchises),
            "supportedLanguages" => json_decode($this->supportedLanguages),
            "ageRatings" => json_decode($this->ageRatings),
            "regionalReleases" => json_decode($this->regionalReleases),
            "media" => json_decode($this->media),
            "websites" => json_decode($this->websites),
            "timesToBeat" => json_decode($this->timesToBeat),

            "createdAt" => $this->createdAt,
            "updatedAt" => $this->updatedAt,
        ];
    }

    public function validate(): array {
        return [];
    }
    
    // Get/Set id
    public function getID(): int { return $this->id; }
    public function setID(int $newID) { $this->id = $newID; }
    
    // Get/Set name
    public function getName(): string { return $this->name; }
    public function setName(string $newName) { $this->name = $newName; }
    
    // Get/Set officialReleaseDate
    public function getOfficialReleaseDate(): int { return $this->officialReleaseDate; }
    public function setOfficialReleaseDate(int $newOfficialReleaseDate) { $this->officialReleaseDate = $newOfficialReleaseDate; }
    
    // Get/Set summary
    public function getSummary(): string { return $this->summary; }
    public function setSummary(string $newSummary) { $this->summary = $newSummary; }
    
    // Get/Set premise
    public function getPremise(): string { return $this->premise; }
    public function setPremise(string $newPremise) { $this->premise = $newPremise; }
    
    // Get/Set createdAt
    public function getCreatedAt(): int { return $this->createdAt; }
    public function setCreatedAt(int $newCreatedAt) { $this->createdAt = $newCreatedAt; }
    
    // Get/Set updatedAt
    public function getUpdatedAt(): int { return $this->updatedAt; }
    public function setUpdatedAt(int $newUpdatedAt) { $this->updatedAt = $newUpdatedAt; }
}