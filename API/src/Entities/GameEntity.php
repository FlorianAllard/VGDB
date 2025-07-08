<?php

namespace Entities;

use Abstract\AbstractEntity;

class GameEntity extends AbstractEntity {
    private int $id = 0;
    private string $name = "";
    private int $officialReleaseDate = 0;
    private string $summary = "";
    private string $premise = "";

    private ?string $covers = NULL;
    private ?string $genres = NULL;
    private ?string $platforms = NULL;
    private ?string $modes = NULL;
    private ?string $perspectives = NULL;
    private ?string $themes = NULL;
    private ?string $involvedCompanies = NULL;
    private ?string $engines = NULL;
    private ?string $series = NULL;
    private ?string $franchises = NULL;
    private ?string $supportedLanguages = NULL;
    private ?string $ageRatings = NULL;
    private ?string $regionalReleases = NULL;
    private ?string $media = NULL;
    private ?string $websites = NULL;
    private ?string $timesToBeat = NULL;

    private int $createdAt = 0;
    private int $updatedAt = 0;

    public function __construct() { }

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

            "covers" => $this->covers ? json_decode($this->covers) : null,
            "genres" => $this->genres ? json_decode($this->genres) : null,
            "platforms" => $this->platforms ? json_decode($this->platforms) : null,
            "modes" => $this->modes ? json_decode($this->modes) : null,
            "perspectives" => $this->perspectives ? json_decode($this->perspectives) : null,
            "themes" => $this->themes ? json_decode($this->themes) : null,
            "involvedCompanies" => $this->involvedCompanies ? json_decode($this->involvedCompanies) : null,
            "engines" => $this->engines ? json_decode($this->engines) : null,
            "series" => $this->series ? json_decode($this->series) : null,
            "franchises" => $this->franchises ? json_decode($this->franchises) : null,
            "supportedLanguages" => $this->supportedLanguages ? json_decode($this->supportedLanguages) : null,
            "ageRatings" => $this->ageRatings ? json_decode($this->ageRatings) : null,
            "regionalReleases" => $this->regionalReleases ? json_decode($this->regionalReleases) : null,
            "media" => $this->media ? json_decode($this->media) : null,
            "websites" => $this->websites ? json_decode($this->websites) : null,
            "timesToBeat" => $this->timesToBeat ? json_decode($this->timesToBeat) : null,

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
    
    // Get/Set covers
    public function getCovers(): string { return $this->covers; }
    public function setCovers(string $newCovers) { $this->covers = $newCovers; }
    
    // Get/Set genres
    public function getGenres(): string { return $this->genres; }
    public function setGenres(string $newGenres) { $this->genres = $newGenres; }
    
    // Get/Set platforms
    public function getPlatforms(): string { return $this->platforms; }
    public function setPlatforms(string $newPlatforms) { $this->platforms = $newPlatforms; }
    
    // Get/Set createdAt
    public function getCreatedAt(): int { return $this->createdAt; }
    public function setCreatedAt(int $newCreatedAt) { $this->createdAt = $newCreatedAt; }
    
    // Get/Set updatedAt
    public function getUpdatedAt(): int { return $this->updatedAt; }
    public function setUpdatedAt(int $newUpdatedAt) { $this->updatedAt = $newUpdatedAt; }
}