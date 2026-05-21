"use client";

import { LogoSvg } from "@/components/LogoSvg";
import { adminLoginAction, type AdminLoginState } from "../actions";
import styles from "../admin.module.scss";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const initialLoginState: AdminLoginState = {};

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    adminLoginAction,
    initialLoginState
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      router.push("/admin");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className={styles.loginShell}>
      <div className={styles.loginBackdrop} aria-hidden />
      <div className={styles.loginGlow} aria-hidden />
      <div className={styles.loginGlowRight} aria-hidden />

      <div className={styles.loginInner}>
        <Link
          href="/"
          className={styles.loginBrand}
          aria-label="AfrESH Modeling home"
        >
          <LogoSvg className={styles.loginBrandLogo} height={80} alt="" />
        </Link>

        <div className={styles.loginCard}>
          <div className={styles.loginCardAccent} aria-hidden />
          <div className={styles.loginCardHeader}>
            <div className={styles.loginKicker}>
              <span className={styles.loginKickerLine} />
              <span>Secure access</span>
            </div>
            <h1 className={styles.loginHeading}>Administration</h1>
            <p className={styles.loginLead}>
              Staff Only.
            </p>
          </div>

          <form action={formAction} className={styles.loginForm}>
            {"error" in state && state.error ? (
              <div className={styles.loginError} role="alert">
                {state.error}
              </div>
            ) : null}

            <div className={styles.loginField}>
              <label className={styles.loginLabel} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                className={styles.loginInput}
                placeholder="you@agency.com"
                required
              />
            </div>

            <div className={styles.loginField}>
              <label className={styles.loginLabel} htmlFor="password">
                Password
              </label>
              <div className={styles.loginPasswordWrap}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={styles.loginInput}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.loginPasswordToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                    aria-hidden
                  />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.loginSubmit}
              disabled={pending}
            >
              <span>{pending ? "Signing in…" : "Sign in"}</span>
            </button>
          </form>
        </div>

        <Link href="/" className={styles.loginFooterLink}>
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
