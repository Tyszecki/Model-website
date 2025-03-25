// ... (wszystko powyżej pozostaje bez zmian aż do sekcji zoomu)

// ZOOM DLA KOMPUTERA (DELIKATNIEJSZY)
sceneContainer.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // Mniejsza czułość (0.01 zamiast 0.05)
    const zoomFactor = e.deltaY * 0.01;
    
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // Płynny zoom z ograniczeniami
    const minDistance = 5;
    const maxDistance = 50;
    const target = new THREE.Vector3(0, 5, 0);
    const currentDistance = camera.position.distanceTo(target);
    
    let newDistance = currentDistance - zoomFactor;
    newDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
    
    camera.position.sub(target).normalize().multiplyScalar(newDistance).add(target);
    camera.lookAt(target);
}, { passive: false });

// ZOOM DLA TELEFONU (WIĘKSZA MOC)
let initialPinchDistance = 0;

sceneContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        initialPinchDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
});

sceneContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        
        // 2x większa czułość niż wcześniej (0.2 zamiast 0.1)
        const zoomFactor = (initialPinchDistance - currentDistance) * 0.2;
        
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        
        const minDistance = 5;
        const maxDistance = 50;
        const target = new THREE.Vector3(0, 5, 0);
        const currentCamDistance = camera.position.distanceTo(target);
        let newDistance = currentCamDistance - zoomFactor;
        newDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
        
        camera.position.sub(target).normalize().multiplyScalar(newDistance).add(target);
        camera.lookAt(target);
        
        initialPinchDistance = currentDistance;
        e.preventDefault();
    }
}, { passive: false });

// ... (reszta kodu pozostaje bez zmian)
