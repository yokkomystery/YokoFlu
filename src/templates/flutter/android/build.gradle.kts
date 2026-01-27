plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
}

def localProperties = new Properties()
def localPropertiesFile = rootProject.file('local.properties')
if (localPropertiesFile.exists()) {
    localPropertiesFile.withReader('UTF-8') { reader ->
        localProperties.load(reader)
    }
}

def flutterVersionCode = localProperties.getProperty('flutter.versionCode')
if (flutterVersionCode == null) {
    flutterVersionCode = '1'
}

def flutterVersionName = localProperties.getProperty('flutter.versionName')
if (flutterVersionName == null) {
    flutterVersionName = '1.0'
}

android {
    namespace "{{PACKAGE_NAME}}"
    compileSdkVersion flutter.compileSdkVersion
    ndkVersion = "27.0.12077973"

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = '17'
    }

    sourceSets {
        main.java.srcDirs += 'src/main/kotlin'
    }

    defaultConfig {
        applicationId "{{PACKAGE_NAME}}"
        minSdkVersion flutter.minSdkVersion
        targetSdkVersion flutter.targetSdkVersion
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        resValue "string", "app_name", "{{APP_NAME}}"
    }

    buildTypes {
        release {
            // TODO: 本番リリース前に必ず署名設定を変更してください
            // 1. android/key.properties ファイルを作成
            // 2. 以下のコメントを解除してdebug署名を削除
            // signingConfig signingConfigs.release
            signingConfig signingConfigs.debug // 開発用：本番では削除

            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            signingConfig signingConfigs.debug
        }
    }

    // TODO: 本番リリース用の署名設定
    // android/key.properties を作成し、以下を記述:
    // storePassword=YOUR_STORE_PASSWORD
    // keyPassword=YOUR_KEY_PASSWORD
    // keyAlias=YOUR_KEY_ALIAS
    // storeFile=YOUR_KEYSTORE_PATH
    //
    // その後、以下のコメントを解除:
    // def keystoreProperties = new Properties()
    // def keystorePropertiesFile = rootProject.file('key.properties')
    // if (keystorePropertiesFile.exists()) {
    //     keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    // }
    // signingConfigs {
    //     release {
    //         keyAlias keystoreProperties['keyAlias']
    //         keyPassword keystoreProperties['keyPassword']
    //         storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
    //         storePassword keystoreProperties['storePassword']
    //     }
    // }

    {{#ENVIRONMENT_SEPARATION}}
    flavorDimensions += "environment"
    
    productFlavors {
        create("staging") {
            dimension = "environment"
            applicationIdSuffix = ".staging"
            resValue("string", "app_name", "{{APP_NAME}} Staging")
        }
        create("production") {
            dimension = "environment"
            resValue("string", "app_name", "{{APP_NAME}}")
        }
    }
    {{/ENVIRONMENT_SEPARATION}}
}

flutter {
    source '../..'
}

dependencies {
    implementation "org.jetbrains.kotlin:kotlin-stdlib-jdk7:$kotlin_version"
} 