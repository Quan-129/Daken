export const GameConfig: any = {
    difficulty: {
        baseSpeed: 1.8,
        speedIncrement: 0.15,
        basePointsPerKill: 10,
        multiplierStep: 0.2,
        maxMultiplier: 3.0,
        perfectComboRequirement: 5
    },
    timing: {
        spawnInterval: 2000,
        easyModeRespawnDelay: 2000
    },
    speeds: {
        wave3SpeedBoost: 0.5,
        wave5SpeedBoost: 0.8 
    },
    audio: {
        defaultTtsRate: 0.9,
        bgmVolume: 0.6,
        sfxVolume: 0.5
    },
    rankThresholds: {
        S: 2000,
        A: 1500,
        B: 1000,
        C: 500,
        D: 0
    },
    studyMode: {
        wave3: {
            basePerfectHits: 1,
            baseImperfectHits: 2,
            retryPenaltyMultiplier: 1, 
            allowPointsOnWeak: false,
            pointsOnWeak: 5
        },
        wave4: {
            basePoints: 20,
            layout: {
                offsetX: 180,
                offsetYStart: 100,
                offsetYSpacing: 80
            },
            timeBonuses: {
                gold: { timeMs: 40000, points: 800 },
                silver: { timeMs: 60000, points: 400 },
                bronze: { timeMs: 90000, points: 200 }
            }
        },
        wave5: {
            spawnIntervalMs: 5000,
            minStackSize: 1,           
            maxStackSize: 2,           
            verticalSpacing: 110,      
            accelerationSettings: {
                rampUpTimeMs: 60000,      // Trả lại 60 giây (1 phút)
                minSpawnIntervalMs: 2500, // Nhịp độ nhanh nhất 2.5 giây/con
                maxSpeedBoost: 0.2        // Tốc độ bơi 0.2
            }
        }
    }
};
