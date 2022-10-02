// Oscar Saharoy 2022

export function ccw( A, B, C ) {
	return (C.y-A.y) * (B.x-A.x) > (B.y-A.y) * (C.x-A.x);
}

export function dist( A, B ) {
	return Math.sqrt( (A.x-B.x) * (A.x-B.x) + (A.y-B.y) * (A.y-B.y) );
}

export function intersectSegments( segA, segB ) {
	return dist( segB.end, segA.start ) < 5	
		|| ccw(segA.start, segB.start, segB.end  ) != ccw(segA.end,   segB.start, segB.end) 
	    && ccw(segA.start, segA.end,   segB.start) != ccw(segA.start, segA.end,   segB.end);
}

