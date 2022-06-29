export type Journal = {
    name: string,
    version: Version,
    lastBuild: string,
    tag: string,
    tags: { [version: string]: string }
    tasks: { [version: string]: Task[] }
    versions: { [version: string]: string }
};

export type Task = {
    action: string,
    group?: string,
    created: string,
    done?: string
};

export type Version = [major: number, minor: number, patch: number];