<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Log an activity.
     */
    public static function log(
        string $action,
        ?string $targetType = null,
        ?int $targetId = null,
        ?string $targetName = null,
        string $status = 'success',
        ?array $metadata = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'target_name' => $targetName,
            'status' => $status,
            'metadata' => $metadata,
            'ip_address' => Request::ip(),
        ]);
    }

    /**
     * Log user login.
     */
    public static function logLogin(): ActivityLog
    {
        return self::log('login', 'Auth', null, 'System Login');
    }

    /**
     * Log user logout.
     */
    public static function logLogout(): ActivityLog
    {
        return self::log('logout', 'Auth', null, 'System Logout');
    }

    /**
     * Log a create action.
     */
    public static function logCreated(string $modelType, int $modelId, string $name): ActivityLog
    {
        return self::log('created', $modelType, $modelId, $name);
    }

    /**
     * Log an update action.
     */
    public static function logUpdated(string $modelType, int $modelId, string $name, ?array $changes = null): ActivityLog
    {
        return self::log('updated', $modelType, $modelId, $name, 'success', $changes);
    }

    /**
     * Log a delete action.
     */
    public static function logDeleted(string $modelType, int $modelId, string $name): ActivityLog
    {
        return self::log('deleted', $modelType, $modelId, $name);
    }

    /**
     * Log a failed action.
     */
    public static function logFailed(string $action, ?string $reason = null): ActivityLog
    {
        return self::log($action, null, null, null, 'error', ['reason' => $reason]);
    }

    /**
     * Log a warning.
     */
    public static function logWarning(string $action, string $message): ActivityLog
    {
        return self::log($action, null, null, null, 'warning', ['message' => $message]);
    }
}
