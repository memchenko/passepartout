declare type ActorType = 'universal' | 'writer' | 'editor' | 'researcher';

declare type HTTPProtocol = 'http' | 'https';

declare type Url = `${HTTPProtocol}://${string}`;

declare type Space = 'knowledge' | 'workspace';

declare type SpacePath = `${Space}://${string}`;
