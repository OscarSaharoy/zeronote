// Oscar Saharoy 2022

// returns true if points A B C are ordered counter clockwise
export const ccw = (A, B, C) =>
	(C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);

// euclidian distance between A and B
export const dist = (A, B) =>
	length( sub( A, B ) );

// returns true if segA intersects segB
export const intersectSegments = (segA, segB) =>
	dist( segB.end, segA.start ) < 5	
	|| ccw(segA.start, segB.start, segB.end  ) != ccw(segA.end,   segB.start, segB.end) 
	&& ccw(segA.start, segA.end,   segB.start) != ccw(segA.start, segA.end,   segB.end);

export const segment = (A, B) =>
	({ start: A, end: B });

export const add = (A, B) =>
	({ x: A.x + B.x, y: A.y + B.y });

export const sub = (A, B) =>
	({ x: A.x - B.x, y: A.y - B.y });

export const mul = (A, k) =>
	({ x: A.x * k, y: A.y * k });

export const div = (A, k) =>
	({ x: A.x / k, y: A.y / k });

export const length = (A) =>
	Math.sqrt( A.x**2 + A.y**2 );

export const normalise = (A) =>
	mul( A, 1/length(A) );

export const direction = (A, B) =>
	normalise( sub( B, A ) );	

export const dot = (A, B) =>
	A.x * B.x + A.y * B.y;

