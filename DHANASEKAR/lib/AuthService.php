<?php
declare(strict_types=1);

require_once __DIR__ . '/UserRepository.php';

class AuthService
{
    public function __construct(private readonly UserRepository $users = new UserRepository())
    {
    }

    public function login(string $email, string $password): array
    {
        try {
            $user = $this->users->findByIdentity($email);

            // Plain password comparison (no hashing)
            if (!$user || $user['password_hash'] !== $password) {
                json_response(['error' => 'Invalid credentials'], 422);
            }

            set_session_user($user);
            
            // Generate simple token for localStorage
            $token = base64_encode($user['id'] . ':' . $user['email'] . ':' . time());

            return [
                'user' => $_SESSION['user'],
                'token' => $token
            ];
        } catch (Exception $e) {
            error_log('Login Error: ' . $e->getMessage());
            json_response(['error' => 'Internal server error'], 500);
        }
    }

    public function register(array $data): array
    {
        try {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                json_response(['error' => 'Invalid email address'], 422);
            }

            if ($this->users->findByEmail($data['email'])) {
                json_response(['error' => 'Email already in use'], 409);
            }

            $payload = [
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'password_hash' => $data['password'], // Store plain password
                'role' => $data['role'] ?? 'user',
                'phone' => $data['phone'] ?? null,
            ];

            $user = $this->users->create($payload);

            return [
                'id' => $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'phone' => $user['phone'],
            ];
        } catch (Exception $e) {
            error_log('Register Error: ' . $e->getMessage());
            json_response(['error' => 'Internal server error'], 500);
        }
    }

    public function updateProfile(int $id, array $data): array
    {
        $user = $this->users->updateProfile($id, $data);
        set_session_user($user);

        return $_SESSION['user'];
    }

    public function updatePassword(int $id, string $currentPassword, string $newPassword): void
    {
        try {
            $user = $this->users->findById($id);

            // Plain password comparison
            if (!$user || $user['password_hash'] !== $currentPassword) {
                json_response(['error' => 'Current password is incorrect'], 422);
            }

            $this->users->updatePassword($id, $newPassword); // Store plain password
        } catch (Exception $e) {
            error_log('Update Password Error: ' . $e->getMessage());
            json_response(['error' => 'Internal server error'], 500);
        }
    }
}



