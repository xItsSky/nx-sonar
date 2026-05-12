# Security Policy

The `@itssky/nx-sonar` maintainers take security seriously. Thank you for taking the time to disclose a problem responsibly.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, use one of the following private channels:

- **Preferred:** open a [GitHub Security Advisory](https://github.com/xItsSky/nx-sonar/security/advisories/new) on this repository.
- **Alternative:** email **emo.quentin@gmail.com** with `[nx-sonar security]` in the subject line.

You should receive an acknowledgment within **three business days**. If you do not, please follow up — we'd rather hear from you twice than miss it.

We follow the principle of **coordinated vulnerability disclosure**: we'll work with you on a fix and a public disclosure date, then credit you in the advisory (unless you'd prefer to remain anonymous).

## What should be reported

The security channels are for **demonstrable, verified vulnerabilities in `@itssky/nx-sonar` itself** — for example:

- A flaw that lets a malicious project leak the `SONAR_TOKEN` to disk or to a third party.
- A path-traversal or arbitrary-write vulnerability in the executor or generators.
- Any way for an attacker to escalate privileges or execute arbitrary code through the plugin.

## What should not be reported

**Please use a regular [GitHub issue](https://github.com/xItsSky/nx-sonar/issues/new/choose) (not the security channel) for:**

- Outdated direct or transitive dependencies — even ones with known CVEs — that do **not** demonstrably affect `nx-sonar`'s functionality. We track dependency updates in the open.
- Generic `npm audit` or vulnerability-scanner output, without a specific exploitable path through this codebase.
- Misconfiguration on the user's side (a token committed to git by mistake, a misconfigured `nx.json`) that the plugin already protects against.

## Supported versions

We support the **most recent minor release** of `@itssky/nx-sonar`. Older minors receive fixes only at our discretion for critical vulnerabilities.
