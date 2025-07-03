<?php

header("Access-Control-Allow-Methods: POST, GET");

require_once __DIR__.'/../services/_pdo.php';
require_once __DIR__ . "/../model/reviewModel.php";
require_once __DIR__ . "/../services/_csrf.php";
require_once __DIR__ . '/../services/_debug.php';

switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        if ($action === "publish") {
            publish();
        }
        break;
        // ...other cases...
    case "GET";
        getReviews();
        break;
}

function publish()
{
    $gameID = $_POST['game'] ?? '';
    $userID = $_POST['user'] ?? '';
    $platformID = $_POST['platform'] ?? '';
    $rating = $_POST['rating'] ?? '';
    $content = $_POST['content'] ?? '';
    $error = [];
    $status = 400;

    // Success
    if (empty($error)) {
        $pdo = pdoConnection();
        $sql = $pdo -> prepare(
            "INSERT INTO reviews(game_id, user_id, platform_id, rating, content, created_at)
            VALUES(:game_id, :user_id, :platform_id, :rating, :content, :created_at)");
        $sql -> execute([
            'game_id' => $gameID,
            'user_id' => $userID,
            'platform_id' => $platformID,
            'rating' => $rating,
            'content' => $content,
            'created_at' => time()
        ]);

        echo json_encode(['status' => 200]);
        return;
    }

    echo json_encode(['status' => $status, 'data' => $error]);
}

function getReviews() {
    $startTime = time();
    $error = [];
    $status = 400;

    $conditions = [];
    $params = [];
    foreach ($_GET as $key => $value) {
        if ($key === 'limit') continue;
        if ($key === 'offset') continue;

        $valueArray = explode(",", $value);
        $invert = str_ends_with($key, "!");
        $key = rtrim($key, "!");
        $condString = "$key ". ($invert ? "NOT " : "") ."IN (";
        for ($i = 0; $i < count($valueArray); $i++) {
            $condString .=  ":$key$i" . ($i < count($valueArray) - 1 ? "," : "");
            $params[":$key$i"] = $valueArray[$i];
        }
        $condString .= ")";
        $conditions[] = $condString;
    }
    $whereClause = count($conditions)
        ? "WHERE " . implode(" AND ", $conditions)
        : "";

    if (empty($error)) {
        $pdo = pdoConnection();

        $sql = sprintf(
            "SELECT reviews.*, %s FROM reviews $whereClause",
            implode(",\n", [getUserSubquery()])
        );

        if ($_GET['limit']) {
            $sql .= " LIMIT " . intval($_GET['limit']);
        }
        if ($_GET['offset']) {
            $sql .= " OFFSET " . intval($_GET['offset']);
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($reviews as $i => $review) {
            $reviews[$i]['users'] = json_decode($reviews[$i]['users'], true);
        }

        $time = round((microtime(true) - $startTime), 3);
        echo json_encode([
            'status' => 200,
            'time' => $time . " s",
            'data' => $reviews]);
        return;
    }

    echo json_encode(['status' => $status, 'data' => $error]);
}

function getUserSubquery() {
    return <<<SQL
    (
        SELECT JSON_OBJECT(
            'id', users.id,
            'username', users.username,
            'title', JSON_OBJECT(
                'id', user_titles.id,
                'name', user_titles.name
            ),
            'profilePic', users.profilePic
        )
        FROM users
        JOIN user_titles ON user_titles.id = users.title
        WHERE reviews.user_id = users.id
    ) AS users
    SQL;
}