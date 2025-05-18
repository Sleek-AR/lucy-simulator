// A-Frame Component: Bewegungssteuerung
AFRAME.registerComponent("enable-controls", {
  init: function () {
    this.el.setAttribute("movement-controls", {
      fly: false,
      speed: 0.1,
    });
    this.el.setAttribute("wasd-controls-enabled", false);
  },
});

// A-Frame Component: Thumbstick Bewegung für VR Controller
AFRAME.registerComponent("move-rig-with-thumbstick", {
  schema: { speed: { type: "number", default: 0.1 } },
  init: function () {
    this.rig = document.querySelector("#cameraRig");
    this.camera = document.querySelector("#camera");
    this.direction = new THREE.Vector3();

    this.el.addEventListener("thumbstickmoved", (e) => {
      this.direction.set(e.detail.x, 0, e.detail.y);
      this.direction.multiplyScalar(this.data.speed);

      const camQuat = this.camera.object3D.quaternion;
      this.direction.applyQuaternion(camQuat);

      this.rig.object3D.position.add(this.direction);
    });
  },
});
