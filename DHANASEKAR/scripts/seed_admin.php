<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/UserRepository.php';

if ($argc < 3) {
    fwrite(STDERR, "Usage: php seed_admin.php <email> <password>\n");
    exit(1);
}

$email = $argv[1];
$password = $argv[2];

$repo = new UserRepository();

if ($repo->findByEmail($email)) {
    fwrite(STDERR, "User already exists\n");
    exit(1);
}

$user = $repo->create([
    'full_name' => 'System Administrator',
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
    'role' => 'admin',
    'phone' => null,
]);

fwrite(STDOUT, sprintf("Created admin user with ID %d\n", $user['id']));



