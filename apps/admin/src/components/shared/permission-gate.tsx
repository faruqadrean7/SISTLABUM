"use client";

import React from "react";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/types/auth";

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string | string[];
  role?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permission,
  role,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasRole } = useAuth();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
