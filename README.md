# Globus Aws Setup Wizard

## Introduction
`globus-aws-setup-wizard` is a tool designed to simplify the process of setting up AWS resources for use with Globus services. This Electron app provides a user-friendly interface for configuring AWS S3 buckets, IAM roles, and other necessary settings to enable seamless data transfer and management between AWS and Globus.

## Features
- Interactive wizard interface for step-by-step AWS resource configuration
- Automated setup of S3 buckets with proper permissions
- IAM role and policy configuration for Globus integration
- Cross-platform support (Windows, macOS and Linux)
- Real-time validation of AWS credentials and configurations
- Error handling and detailed feedback for troubleshooting

## Prerequisites
Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm (v6 or later)
- An AWS account with necessary permissions to create S3 buckets, IAM roles, etc.

#### Additional Requirements for Cross-Platform Building on macOS
If you're using a Mac and want to build Windows executables:
- Wine (only required when building Windows executables on macOS)
  ```bash
  # Install Wine using Homebrew
  brew install wine
  ```

### Globus Requirements
- A Globus account (sign up at www.globus.org if you don't have one)
- Basic understanding of Globus endpoints and collections

## Installation and Local Setup
To install `globus-aws-setup-wizard`, follow these steps:

1. Clone the repository:
```bash
git clone https://github.com/ASUCICREPO/globus-aws-setup-wizard.git
```

2. Navigate to the project directory:
```bash
cd globus-aws-setup-wizard
```

3. Install dependencies:
```bash
npm install
```

4. To run globus-aws-setup-wizard, execute the following command:
```bash
npm start
```

## Building Executables

### Building the Windows EXE
To build the Windows executable file, use the following command:
```
  sudo npx electron-builder --win --x64 --ia32
```
This command will generate executable files for both 64-bit and 32-bit Windows. The resulting executables will be found in:
- dist/win-unpacked/ (unpacked application)
- dist/ (installer executables)



### Building Mac ARM and Intel Executable (Universal)
To build a universal executable file for Mac that works on both ARM and Intel architectures, use the following command:
```
  sudo npx electron-builder --mac --universal
```

The --universal flag ensures that the resulting application is compatible with both Apple Silicon (M1/M2) and Intel-based Mac systems. The built application will be available in:
- dist/mac-universal/ (unpacked application)
- dist/ (DMG installer)

## Contributing
Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes



