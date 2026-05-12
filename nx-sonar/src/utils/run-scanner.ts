import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import scanner from 'sonarqube-scanner';
import type { ScannerProperties } from './build-scanner-properties';

export interface ScanResult {
  success: boolean;
}

export async function runScanner(
  properties: ScannerProperties,
): Promise<ScanResult> {
  if (process.env.NX_SONAR_DRY_RUN === '1') {
    const out = process.env.NX_SONAR_DRY_RUN_OUT;
    if (!out) {
      throw new Error(
        'NX_SONAR_DRY_RUN=1 requires NX_SONAR_DRY_RUN_OUT to be set to a file path.',
      );
    }
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, JSON.stringify(properties, null, 2));
    return { success: true };
  }

  const serverUrl = properties['sonar.host.url'];
  return await new Promise<ScanResult>((resolve) => {
    scanner(
      {
        serverUrl,
        options: properties,
      },
      (error?: unknown) => {
        if (error) {
          console.error('[@itssky/nx-sonar] scanner failed:', error);
          resolve({ success: false });
        } else {
          resolve({ success: true });
        }
      },
    );
  });
}
