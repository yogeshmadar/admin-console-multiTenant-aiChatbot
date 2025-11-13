
export const REDIS = 'redis'
export const FILESYSTEM = 'filesystem'
type crawlDataStorageLocation = typeof REDIS | typeof FILESYSTEM

export const crawlDataStorageLocation = process.env.CRAWL_DATA_STORAGE_LOCATION! as crawlDataStorageLocation