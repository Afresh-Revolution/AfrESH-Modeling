"use client";

import { useCallback, useRef, useState } from "react";

function showToast(message: string, type: "success" | "error" = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icon =
    type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

export function ApplyForm() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    setUploadedFiles((prev) => {
      const merged = [...prev];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (merged.length >= 5) break;
        merged.push(file);
      }
      return merged;
    });
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    form.querySelectorAll(".form-group").forEach((g) => g.classList.remove("error"));

    const fname = (form.elements.namedItem("fname") as HTMLInputElement)?.value?.trim();
    const femail = (form.elements.namedItem("femail") as HTMLInputElement)?.value?.trim();
    const fdob = (form.elements.namedItem("fdob") as HTMLInputElement)?.value;
    const fterms = (form.elements.namedItem("fterms") as HTMLInputElement)?.checked;

    let ok = true;
    if (!fname) {
      form.querySelector("#fname")?.closest(".form-group")?.classList.add("error");
      ok = false;
    }
    if (!femail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(femail)) {
      form.querySelector("#femail")?.closest(".form-group")?.classList.add("error");
      ok = false;
    }
    if (!fdob) {
      form.querySelector("#fdob")?.closest(".form-group")?.classList.add("error");
      ok = false;
    }
    if (!fterms) {
      showToast("Please agree to the terms of service.", "error");
      ok = false;
    }
    if (!ok) return;

    const apiBase = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
    if (!apiBase) {
      showToast(
        "Applications are not available right now. Please try again later.",
        "error"
      );
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.set("full_name", fname!);
      body.set("email", femail!);
      body.set("date_of_birth", fdob!);
      body.set(
        "phone",
        (form.elements.namedItem("fphone") as HTMLInputElement)?.value ?? ""
      );
      body.set(
        "height",
        (form.elements.namedItem("fheight") as HTMLInputElement)?.value ?? ""
      );
      body.set(
        "city",
        (form.elements.namedItem("fcity") as HTMLInputElement)?.value ?? ""
      );
      body.set(
        "experience_level",
        (form.elements.namedItem("fexp") as HTMLSelectElement)?.value ?? ""
      );
      body.set(
        "portfolio_url",
        (form.elements.namedItem("fportfolio") as HTMLInputElement)?.value ?? ""
      );
      body.set(
        "message",
        (form.elements.namedItem("fmsg") as HTMLTextAreaElement)?.value ?? ""
      );
      uploadedFiles.forEach((f) => body.append("photos", f));

      const res = await fetch(`${apiBase}/api/applications`, {
        method: "POST",
        body,
        mode: "cors",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        ok?: boolean;
      };

      if (!res.ok) {
        showToast(data.error ?? "Something went wrong. Try again later.", "error");
        return;
      }

      showToast(
        "Application submitted successfully! We will review your profile and get back to you within 7 business days.",
        "success"
      );
      form.reset();
      setUploadedFiles([]);
    } catch {
      showToast("Network error. Check your connection and try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="apply-form reveal reveal-delay-2"
      id="applyForm"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fname">Full Name</label>
          <input type="text" id="fname" name="fname" placeholder="Your full name" required />
          <div className="form-error">Please enter your name</div>
        </div>
        <div className="form-group">
          <label htmlFor="femail">Email Address</label>
          <input
            type="email"
            id="femail"
            name="femail"
            placeholder="name@example.com"
            required
          />
          <div className="form-error">Please enter a valid email</div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fphone">Phone Number</label>
          <input type="tel" id="fphone" name="fphone" placeholder="+1 (555) 000-0000" />
        </div>
        <div className="form-group">
          <label htmlFor="fdob">Date of Birth</label>
          <input type="date" id="fdob" name="fdob" required />
          <div className="form-error">Please enter your date of birth</div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fheight">Height</label>
          <input type="text" id="fheight" name="fheight" placeholder='e.g. 5&apos;10&quot;' />
        </div>
        <div className="form-group">
          <label htmlFor="fcity">City / Location</label>
          <input type="text" id="fcity" name="fcity" placeholder="New York, NY" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="fexp">Experience Level</label>
        <select id="fexp" name="fexp" defaultValue="none">
          <option value="none">No Experience</option>
          <option value="beginner">Beginner (0-1 years)</option>
          <option value="intermediate">Intermediate (1-3 years)</option>
          <option value="professional">Professional (3+ years)</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="fportfolio">Portfolio URL (optional)</label>
        <input
          type="url"
          id="fportfolio"
          name="fportfolio"
          placeholder="https://your-portfolio.com"
        />
      </div>
      <div
        className="form-upload"
        id="uploadArea"
        role="button"
        tabIndex={0}
        aria-label="Upload photos"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "var(--gold)";
          e.currentTarget.style.background = "rgba(201,168,76,0.06)";
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = "";
          e.currentTarget.style.background = "";
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = "";
          e.currentTarget.style.background = "";
          handleFiles(e.dataTransfer.files);
        }}
      >
        <i className="fas fa-cloud-upload-alt" aria-hidden />
        <p>
          Drag photos here or <span>browse files</span>
        </p>
        <p style={{ fontSize: "0.75rem", marginTop: "0.3rem", color: "var(--fg-muted)" }}>
          Up to 5 photos. Min 2 headshots + 1 full body.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      <div id="fileList" style={{ marginBottom: "1rem" }}>
        {uploadedFiles.map((f, i) => (
          <div
            key={`${f.name}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.4rem 0",
              fontSize: "0.85rem",
              color: "var(--fg-muted)",
            }}
          >
            <i className="fas fa-image" style={{ color: "var(--gold)", fontSize: "0.75rem" }} aria-hidden />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.name}
            </span>
            <button
              type="button"
              onClick={() => removeFile(i)}
              style={{
                background: "none",
                border: "none",
                color: "#e85d75",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
              aria-label="Remove file"
            >
              <i className="fas fa-times" aria-hidden />
            </button>
          </div>
        ))}
      </div>
      <div className="form-group">
        <label htmlFor="fmsg">Tell Us About Yourself</label>
        <textarea id="fmsg" name="fmsg" rows={3} placeholder="Share anything you think we should know..." />
      </div>
      <div className="form-checkbox">
        <input type="checkbox" id="fterms" name="fterms" required />
        <label htmlFor="fterms">
          I agree to the ONYXX CLUB terms of service and privacy policy. I confirm that all information provided is accurate.
        </label>
      </div>
      <button
        type="submit"
        className="btn-primary"
        style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Submit Application"}
      </button>
    </form>
  );
}
