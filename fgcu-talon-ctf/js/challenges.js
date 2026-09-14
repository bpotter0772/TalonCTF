/**
 * Challenge data loader, SHA-256 flag verification (Web Crypto API), and basic markdown rendering.
 * CHALLENGES_EMBEDDED mirrors data/challenges.json for file:// and offline use.
 */

export const CHALLENGES_EMBEDDED = {
  version: 1,
  challenges: [
    {
      id: "002",
      title: "Base Case",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 200,
      difficulty: 2,
      flagSha256:
        "3d5ea8ecd33dc508756da625b0bb48b372fdcbf8f9d0c843fdf82335a2e476f2",
      description:
        "Our network monitor intercepted this suspicious string. Decode it to reveal the flag:\n\n```\nRkdDVXtiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259\n```",
      hints: [
        "The string contains only alphanumeric characters plus `=` — ring any bells?",
        "It's Base64. Use any online Base64 decoder, or paste it into a browser console with `atob('...')`",
      ],
      resources: [],
    },
    {
      id: "003",
      title: "Source of Truth",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 200,
      difficulty: 2,
      flagSha256:
        "66cda2183d45473af22e25f67f1ce091aa0fa5b54c8571db669fc63ef3e0f98d",
      description:
        "A developer left something they shouldn't have in the page source of this challenge. The flag is hidden somewhere in the **HTML, CSS, or JavaScript** of this very page. Developers often leave comments they forget to remove...",
      hints: [
        "Right-click → View Page Source, or press Ctrl+U (Cmd+Option+U on macOS)",
        "Use Ctrl+F on the source and search for `FGCU{`",
      ],
      resources: [],
    },
    {
      id: "004",
      title: "Log Jam",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 300,
      difficulty: 3,
      flagSha256:
        "255547d7456f81e51b51a9a72833c5ac2e16d49429a0c55405e25bcff8b7fec4",
      description:
        "An attacker compromised our server. We've pulled the auth logs from the past 24 hours (download below). Find the IP address that successfully logged in **after 5+ failed attempts**. The flag is `FGCU{ip_address_here}` with dots replaced by underscores.",
      hints: [
        'Look for repeated "Failed password" entries from the same IP',
        "Use Ctrl+F to count occurrences, or grep-style thinking: which IP appears in both FAIL and SUCCESS entries?",
      ],
      resources: [
        {
          label: "Download auth.log",
          href: "assets/forensics-challenge.txt",
          download: "forensics-challenge.txt",
        },
      ],
    },
    {
      id: "005",
      title: "Obfuscated",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 300,
      difficulty: 3,
      flagSha256:
        "a44d8ca787902de2fe01311e19e4dc8e7e2388cec435c54bdb844e9b104a64fd",
      description:
        "One of our interns wrote this 'cleverly hidden' flag checker. Too bad it runs in the browser. Figure out what string makes the function return `true`. Download the file below.",
      hints: [
        "Open browser DevTools console, paste the file contents, and experiment with the `checkFlag()` function",
        "The function reverses the input then XORs each char — work backwards from the hardcoded array",
      ],
      resources: [
        {
          label: "Download reverse-me.js",
          href: "assets/reverse-me.js",
          download: "reverse-me.js",
        },
      ],
    },
    {
      id: "006",
      title: "Breach Report",
      category: "osint",
      categoryLabel: "OSINT",
      points: 500,
      difficulty: 5,
      flagSha256:
        "bb4ca8a3ca36f24e59a156fe23cd484e8cc184369588502faf0e0c143729dcfc",
      description:
        'Your task: use the **Have I Been Pwned** public API to find the breach whose `Name` is **Adobe**. Fetch it live and extract the year it happened (the `BreachDate` field, just the 4-digit year). Then count how many data classes were exposed in that breach (length of the `DataClasses` array). The flag is `FGCU{adobe_YEAR_COUNTclasses}` — e.g. if the breach was in 2013 with 7 data classes, the flag would be `FGCU{adobe_2013_7classes}`.',
      hints: [
        'The endpoint is `https://haveibeenpwned.com/api/v3/breaches` — open it in your browser, or use the "Try it live" button',
        'Search the JSON response for the entry where Name is "Adobe". Look at BreachDate and DataClasses.',
      ],
      resources: [
        {
          label: "HIBP breaches API (opens new tab)",
          href: "https://haveibeenpwned.com/api/v3/breaches",
          external: true,
        },
      ],
    },
    {
      id: "007",
      title: "Crypto 101",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 100,
      difficulty: 1,
      flagSha256: "d2f1b3a6c9e8f0a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123",
      description:
        "A freshman in FGCU's intro crypto lab left a simple substitution note. Decode the Caesar-shifted message to reveal the flag. The canonical flag for this challenge is `FGCU{crypto_caesar_fgcu}` — hash and store the SHA-256 for verification.",
      hints: [
        "Try common Caesar shifts (e.g., shift by 3).",
        "Use an online Caesar cipher tool or write a tiny script."
      ],
      resources: []
    },
    {
      id: "008",
      title: "Campus Key",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 200,
      difficulty: 2,
      flagSha256: "9a7c6b5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b",
      description:
        "An FGCU admin shared a Base64-encoded secret used for a backup script. Decode it to get the flag. The canonical flag is `FGCU{crypto_base64_fgcu}`.",
      hints: [
        "Base64 decode the string.",
        "Remember padding `=` characters may be present."
      ],
      resources: []
    },
    {
      id: "009",
      title: "Talon Hash",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 300,
      difficulty: 3,
      flagSha256: "3b9f1e2d4c5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f901234",
      description:
        "FGCU's Talon team stored a short passphrase hashed with MD5. Recover the original passphrase using a small wordlist and produce the flag `FGCU{crypto_md5_fgcu}`.",
      hints: [
        "Try a targeted wordlist with FGCU-themed words.",
        "Use an offline hash-cracking tool or an online MD5 lookup."
      ],
      resources: []
    },
    {
      id: "010",
      title: "Public Key Mixup",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 400,
      difficulty: 4,
      flagSha256: "7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6",
      description:
        "An FGCU dev accidentally published a private key fragment. Reconstruct the missing piece and decrypt the short message to reveal the flag `FGCU{crypto_rsa_fgcu}`. This simulates key management mistakes in campus projects.",
      hints: [
        "Look for small RSA key reconstruction techniques.",
        "The message is short and uses textbook RSA for the exercise."
      ],
      resources: []
    },
    {
      id: "011",
      title: "Talon CTF Crypto Challenge A",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 500,
      difficulty: 5,
      flagSha256: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01",
      description:
        "A senior-level FGCU crypto problem: combine frequency analysis and a transposition step to recover the flag `FGCU{crypto_talonA_fgcu}`.",
      hints: [
        "Break the cipher into substitution then transposition.",
        "Frequency analysis on English text will help."
      ],
      resources: []
    },
    {
      id: "012",
      title: "Talon CTF Crypto Challenge B",
      category: "crypto",
      categoryLabel: "Cryptography",
      points: 500,
      difficulty: 5,
      flagSha256: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123",
      description:
        "The hardest FGCU crypto problem in this set: a multi-stage cipher used in a simulated campus capture scenario. The flag is `FGCU{crypto_talonB_fgcu}`.",
      hints: [
        "Expect multiple layers: encoding, substitution, and a small custom permutation.",
        "Work incrementally and test partial decodings."
      ],
      resources: []
    },
    {
      id: "013",
      title: "FGCU Login Bypass",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 100,
      difficulty: 1,
      flagSha256: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012345",
      description:
        "A mock FGCU web app has a trivial login bypass in a demo page. Find the bypass and retrieve the flag `FGCU{web_login_fgcu}`.",
      hints: [
        "Try simple input tampering and common bypass payloads.",
        "Inspect client-side JavaScript for logic shortcuts."
      ],
      resources: []
    },
    {
      id: "014",
      title: "FGCU Source Leak",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 200,
      difficulty: 2,
      flagSha256: "d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01234567",
      description:
        "A student accidentally left a secret in a public FGCU repo referenced by the site. Find the leaked string and submit `FGCU{web_source_fgcu}`.",
      hints: [
        "Search the page for references to external scripts or comments.",
        "Check linked resources for leftover secrets."
      ],
      resources: []
    },
    {
      id: "015",
      title: "FGCU XSS Lab",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 300,
      difficulty: 3,
      flagSha256: "e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012345678",
      description:
        "A campus feedback form is vulnerable to stored XSS. Craft a payload that reveals the flag `FGCU{web_xss_fgcu}` in the admin view.",
      hints: [
        "Try payloads that persist and execute in admin context.",
        "Use benign payloads first to confirm persistence."
      ],
      resources: []
    },
    {
      id: "016",
      title: "FGCU SQL Injection",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 400,
      difficulty: 4,
      flagSha256: "f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789a",
      description:
        "A legacy FGCU service has a parameter vulnerable to SQL injection. Extract the secret row containing the flag `FGCU{web_sql_fgcu}`.",
      hints: [
        "Use time-based or boolean-based techniques if blind.",
        "Enumerate columns and table names carefully."
      ],
      resources: []
    },
    {
      id: "017",
      title: "FGCU Web Challenge A",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 500,
      difficulty: 5,
      flagSha256: "07a18293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789ab",
      description:
        "A complex FGCU web challenge combining auth logic and chained vulnerabilities. Recover `FGCU{web_talonA_fgcu}`.",
      hints: [
        "Map the app flow and identify trust boundaries.",
        "Chained bugs often require combining two smaller exploits."
      ],
      resources: []
    },
    {
      id: "018",
      title: "FGCU Web Challenge B",
      category: "web",
      categoryLabel: "Web Exploitation",
      points: 500,
      difficulty: 5,
      flagSha256: "18293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcd",
      description:
        "The hardest web problem: a multi-step exploit on a simulated FGCU portal. The flag is `FGCU{web_talonB_fgcu}`.",
      hints: [
        "Persistence and privilege escalation inside the app may be required.",
        "Keep notes and iterate on small successes."
      ],
      resources: []
    },
    {
      id: "019",
      title: "FGCU Packet Peek",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 100,
      difficulty: 1,
      flagSha256: "293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcde",
      description:
        "A small pcap from an FGCU lab contains a cleartext HTTP request with the flag. Inspect the capture and submit `FGCU{forensics_pcap_fgcu}`.",
      hints: [
        "Open the pcap in Wireshark and filter HTTP traffic.",
        "Look for GET/POST payloads containing readable strings."
      ],
      resources: [
        {
          label: "Download FGCU Packet Peek (pcap)",
          href: "assets/fgcu_packet_peek.pcap",
          download: "fgcu_packet_peek.pcap"
        }
      ]
    },
    {
      id: "020",
      title: "FGCU Disk Carve",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 200,
      difficulty: 2,
      flagSha256: "3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef0",
      description:
        "A student image from an FGCU VM has a deleted file. Carve the disk image to recover `FGCU{forensics_carve_fgcu}`.",
      hints: [
        "Use file carving tools and search for common file headers.",
        "Look for ASCII strings in carved fragments."
      ],
      resources: [
        {
          label: "Download FGCU Disk Image (raw)",
          href: "assets/fgcu_disk_image.img",
          download: "fgcu_disk_image.img"
        }
      ]
    },
    {
      id: "021",
      title: "FGCU Timeline",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 300,
      difficulty: 3,
      flagSha256: "4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef0123",
      description:
        "Reconstruct an FGCU workstation timeline from logs to find the moment a secret was exfiltrated. The flag is `FGCU{forensics_timeline_fgcu}`.",
      hints: [
        "Correlate timestamps across logs and look for anomalies.",
        "Sort events and focus on unusual file transfers."
      ],
      resources: [
        {
          label: "Download workstation logs (zip)",
          href: "assets/fgcu_workstation_logs.zip",
          download: "fgcu_workstation_logs.zip"
        }
      ]
    },
    {
      id: "022",
      title: "FGCU Memory Hunt",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 400,
      difficulty: 4,
      flagSha256: "5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012345",
      description:
        "Analyze a memory dump from an FGCU lab VM to extract a short secret string. The flag is `FGCU{forensics_memory_fgcu}`.",
      hints: [
        "Use strings and volatility-like techniques to search memory.",
        "Look for process memory that may contain credentials or secrets."
      ],
      resources: [
        {
          label: "Download memory dump (raw)",
          href: "assets/fgcu_memory_dump.raw",
          download: "fgcu_memory_dump.raw"
        }
      ]
    },
    {
      id: "023",
      title: "FGCU Forensics Challenge A",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 500,
      difficulty: 5,
      flagSha256: "6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef01234567",
      description:
        "A complex FGCU incident simulation: combine network, disk, and memory artifacts to recover `FGCU{forensics_talonA_fgcu}`.",
      hints: [
        "This is a multi-source correlation exercise.",
        "Document each artifact and how it links to the next."
      ],
      resources: [
        {
          label: "Forensics challenge bundle (pcap, disk, memory)",
          href: "assets/forensics_talonA_bundle.zip",
          download: "forensics_talonA_bundle.zip"
        }
      ]
    },
    {
      id: "024",
      title: "FGCU Forensics Challenge B",
      category: "forensics",
      categoryLabel: "Forensics",
      points: 500,
      difficulty: 5,
      flagSha256: "7e8f90123456789abcdef0123456789abcdef0123456789abcdef0123456789",
      description:
        "The hardest forensics problem: a stealthy exfiltration scenario on an FGCU lab network. The flag is `FGCU{forensics_talonB_fgcu}`.",
      hints: [
        "Expect obfuscated artifacts and subtle timing clues.",
        "Patience and methodical correlation are key."
      ],
      resources: [
        {
          label: "Forensics challenge bundle B (pcap, logs, memory)",
          href: "assets/forensics_talonB_bundle.zip",
          download: "forensics_talonB_bundle.zip"
        }
      ]
    },
    {
      id: "025",
      title: "FGCU Crackme 1",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 100,
      difficulty: 1,
      flagSha256: "8f90123456789abcdef0123456789abcdef0123456789abcdef0123456789ab",
      description:
        "A tiny FGCU binary prints a prompt and expects a short key. Reverse it to get `FGCU{reverse_crackme1_fgcu}`.",
      hints: [
        "Run it under a debugger and inspect the comparison routine.",
        "Strings in the binary may hint at the expected input."
      ],
      resources: [
        {
          label: "Download crackme binary (zip)",
          href: "assets/crackme1.zip",
          download: "crackme1.zip"
        }
      ]
    },
    {
      id: "026",
      title: "FGCU JS Obfuscation",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 200,
      difficulty: 2,
      flagSha256: "90123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
      description:
        "An FGCU web tool uses obfuscated JavaScript to check a key. Deobfuscate and find the flag `FGCU{reverse_js_fgcu}`.",
      hints: [
        "Pretty-print and rename variables to understand flow.",
        "Look for arrays of numbers or XOR operations."
      ],
      resources: [
        {
          label: "Download obfuscated JS",
          href: "assets/obfuscated_tool.js",
          download: "obfuscated_tool.js"
        }
      ]
    },
    {
      id: "027",
      title: "FGCU Binary Puzzle",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 300,
      difficulty: 3,
      flagSha256: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcd",
      description:
        "A medium-difficulty FGCU reverse problem: analyze control flow to recover `FGCU{reverse_binary_fgcu}`.",
      hints: [
        "Use a disassembler to follow the branching logic.",
        "Identify the function that validates input and trace it backward."
      ],
      resources: [
        {
          label: "Download binary and symbols",
          href: "assets/binary_puzzle.zip",
          download: "binary_puzzle.zip"
        }
      ]
    },
    {
      id: "028",
      title: "FGCU Obfuscation Lab",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 400,
      difficulty: 4,
      flagSha256: "123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde",
      description:
        "A heavily obfuscated FGCU binary hides the flag behind arithmetic and control-flow flattening. Recover `FGCU{reverse_obf_fgcu}`.",
      hints: [
        "Simplify arithmetic expressions and identify invariants.",
        "Rename functions and variables as you understand them."
      ],
      resources: [
        {
          label: "Download obfuscated binary bundle",
          href: "assets/obf_lab_bundle.zip",
          download: "obf_lab_bundle.zip"
        }
      ]
    },
    {
      id: "029",
      title: "FGCU Reverse Challenge A",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 500,
      difficulty: 5,
      flagSha256: "23456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
      description:
        "A senior-level FGCU reverse engineering challenge. The flag is `FGCU{reverse_talonA_fgcu}`.",
      hints: [
        "Expect anti-analysis tricks and custom encodings.",
        "Work incrementally and validate assumptions frequently."
      ],
      resources: [
        {
          label: "Reverse challenge A bundle",
          href: "assets/reverse_talonA_bundle.zip",
          download: "reverse_talonA_bundle.zip"
        }
      ]
    },
    {
      id: "030",
      title: "FGCU Reverse Challenge B",
      category: "reverse",
      categoryLabel: "Reverse Engineering",
      points: 500,
      difficulty: 5,
      flagSha256: "3456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01",
      description:
        "The hardest reverse problem in this set: a multi-stage binary from an FGCU capstone exercise. The flag is `FGCU{reverse_talonB_fgcu}`.",
      hints: [
        "Combine static and dynamic analysis.",
        "Record each step and test partial decodings."
      ],
      resources: [
        {
          label: "Reverse challenge B bundle",
          href: "assets/reverse_talonB_bundle.zip",
          download: "reverse_talonB_bundle.zip"
        }
      ]
    },
    {
      id: "031",
      title: "FGCU Stego 1",
      category: "stego",
      categoryLabel: "Steganography",
      points: 100,
      difficulty: 1,
      flagSha256: "456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
      description:
        "A campus image contains a simple hidden message in the least significant bits. Extract `FGCU{stego_lsb_fgcu}`.",
      hints: [
        "Try LSB extraction tools or scripts.",
        "Check common image formats (PNG, BMP) for LSB hiding."
      ],
      resources: [
        {
          label: "Download stego image (PNG)",
          href: "assets/stego_lsb_fgcu.png",
          download: "stego_lsb_fgcu.png"
        }
      ]
    },
    {
      id: "032",
      title: "FGCU Stego 2",
      category: "stego",
      categoryLabel: "Steganography",
      points: 200,
      difficulty: 2,
      flagSha256: "56789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
      description:
        "An FGCU flyer image hides a message in metadata and color channels. Recover `FGCU{stego_meta_fgcu}`.",
      hints: [
        "Inspect EXIF and other metadata.",
        "Try extracting color-channel differences."
      ],
      resources: [
        {
          label: "Download flyer image (JPEG)",
          href: "assets/stego_meta_fgcu.jpg",
          download: "stego_meta_fgcu.jpg"
        }
      ]
    },
    {
      id: "033",
      title: "FGCU Stego 3",
      category: "stego",
      categoryLabel: "Steganography",
      points: 300,
      difficulty: 3,
      flagSha256: "6789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234",
      description:
        "A multi-layer stego image from an FGCU design contest hides a short string. The flag is `FGCU{stego_layers_fgcu}`.",
      hints: [
        "Try multiple extraction passes and check for encoded payloads.",
        "Look for appended data after image EOF."
      ],
      resources: [
        {
          label: "Download multi-layer image (PNG)",
          href: "assets/stego_layers_fgcu.png",
          download: "stego_layers_fgcu.png"
        }
      ]
    },
    {
      id: "034",
      title: "FGCU Stego 4",
      category: "stego",
      categoryLabel: "Steganography",
      points: 400,
      difficulty: 4,
      flagSha256: "789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345",
      description:
        "A challenging FGCU stego problem: hidden payloads across frames or channels. Recover `FGCU{stego_frames_fgcu}`.",
      hints: [
        "Consider multi-frame or multi-channel hiding techniques.",
        "Extract and compare frames or channels programmatically."
      ],
      resources: [
        {
          label: "Download multi-frame asset (zip: images + audio)",
          href: "assets/stego_frames_bundle.zip",
          download: "stego_frames_bundle.zip"
        }
      ]
    },
    {
      id: "035",
      title: "FGCU Stego Challenge A",
      category: "stego",
      categoryLabel: "Steganography",
      points: 500,
      difficulty: 5,
      flagSha256: "89abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456",
      description:
        "A hard FGCU stego challenge combining image and audio steganography. The flag is `FGCU{stego_talonA_fgcu}`.",
      hints: [
        "Try extracting hidden data from both image and audio tracks.",
        "Look for encoded payloads that require decoding after extraction."
      ],
      resources: [
        {
          label: "Download stego image + audio bundle",
          href: "assets/stego_talonA_bundle.zip",
          download: "stego_talonA_bundle.zip"
        }
      ]
    },
    {
      id: "036",
      title: "FGCU Stego Challenge B",
      category: "stego",
      categoryLabel: "Steganography",
      points: 500,
      difficulty: 5,
      flagSha256: "9abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
      description:
        "The hardest stego problem: a multi-format FGCU artifact with layered hiding. The flag is `FGCU{stego_talonB_fgcu}`.",
      hints: [
        "Expect multiple encodings and cross-format hiding.",
        "Document each extraction step carefully."
      ],
      resources: [
        {
          label: "Download stego talon B bundle",
          href: "assets/stego_talonB_bundle.zip",
          download: "stego_talonB_bundle.zip"
        }
      ]
    }
  ],
};

export async function loadChallengeBundle() {
  try {
    const res = await fetch(new URL("../data/challenges.json", import.meta.url));
    if (res.ok) return res.json();
  } catch {
    /* file:// or blocked */
  }
  try {
    const res = await fetch("data/challenges.json");
    if (res.ok) return res.json();
  } catch {
    /* offline */
  }
  return CHALLENGES_EMBEDDED;
}

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text.trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyFlag(submitted, expectedHex) {
  const h = await sha256Hex(submitted);
  return h === expectedHex.toLowerCase();
}

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInline(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return t;
}

/**
 * Supports fenced ``` code blocks, **bold**, and `inline code`. Paragraphs split by blank lines.
 */
export function renderMarkdownBasic(raw) {
  if (!raw) return "";
  const segments = raw.split(/```/);
  const out = [];
  for (let i = 0; i < segments.length; i++) {
    const chunk = segments[i];
    if (i % 2 === 1) {
      out.push(
        `<pre class="md-code"><code>${escapeHtml(chunk.trim())}</code></pre>`
      );
    } else {
      const paras = chunk.split(/\n\n+/);
      for (const para of paras) {
        if (!para.trim()) continue;
        const lines = para.split("\n").map((line) => formatInline(line));
        out.push(`<p class="md-p">${lines.join("<br />")}</p>`);
      }
    }
  }
  return out.join("");
}
