# Use Ubuntu as base for broad compatibility
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# 1. Install Basic Dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    openjdk-17-jdk \
    gradle \
    && rm -rf /var/lib/apt/lists/*

# 2. Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# 3. Setup Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/34.0.0

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O cmdline-tools.zip \
    && unzip -q cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm cmdline-tools.zip

# 4. Accept Licenses & Install Android Packages
# Expo 54 / React Native 0.76+ typically targets Android 34
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" \
                  "platforms;android-34" \
                  "build-tools;34.0.0" \
                  "extras;google;m2repository" \
                  "extras;android;m2repository"

# 5. Install Global Tools
RUN npm install -g eas-cli expo-cli

# 6. Setup Work Directory
WORKDIR /app

# 7. Copy Dependencies
COPY package.json package-lock.json ./

# 8. Install Dependencies
RUN npm install

# 9. Copy Source Code
COPY . .

# 9.5 Initialize Git (EAS requirement)
# EAS CLI requires a git repository to track build context
RUN git config --global user.email "builder@example.com" \
    && git config --global user.name "Builder" \
    && git init \
    && git add . \
    && git commit -m "Build context"

# Increase JVM memory for Gradle build to prevent Metaspace errors
ENV GRADLE_OPTS="-Xmx4g -XX:MaxMetaspaceSize=1g -Dorg.gradle.daemon=false"

# 10. Default Command
# Runs EAS Build locally. 
# Output will be generated in the container, so you should mount a volume to extract it.
CMD ["eas", "build", "--local", "--platform", "android", "--profile", "production", "--non-interactive", "--output", "/app/output/app-release.apk"]
