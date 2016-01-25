/*"""
Atomic Three.js Application
````````````````````````````````
Creates a 3D visualization of the atomic Universe container.
*/
'use strict';


require.config({
    shim: {
        'nbextensions/exa/atomic/lib/three.min': {
            exports: 'THREE'
        },
        'nbextensions/exa/atomic/lib/TrackballControls': {
            deps: ['nbextensions/exa/atomic/lib/three.min'],
            exports: 'THREE.TrackballControls'
        }
    }
});


define([
    'nbextensions/exa/atomic/lib/three.min',
    'nbextensions/exa/atomic/lib/TrackballControls'
], function(
    THREE,
    TrackballControls
) {
    var vertex_shader = "\
        attribute float size;\
        attribute vec3 color;\
        varying vec3 vColor;\
        \
        void main() {\
            vColor = color;\
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\
            gl_PointSize = size * (450.0 / length(mvPosition.xyz));\
            gl_Position = projectionMatrix * mvPosition;\
        }\
    ";

    var point_frag_shader = "\
        varying vec3 vColor;\
        \
        void main() {\
            if (length(gl_PointCoord * 2.0 - 1.0) > 1.0)\
                discard;\
            gl_FragColor = vec4(vColor, 1.0);\
        }\
    ";

    var circle_frag_shader = "\
        varying vec3 vColor;\
        \
        void main() {\
            if (length(gl_PointCoord * 2.0 - 1.0) > 1.0)\
                discard;\
            if (length(gl_PointCoord * 2.0 - 1.0) < 0.9)\
                discard;\
            gl_FragColor = vec4(vColor, 1.0);\
        }\
    ";

    var AtomicThreeJS = function(canvas) {
        /*"""
        AtomicThreeJS
        ```````````````````````````````````````````````````
        Three.js application for rendering an atomic Universe as an IPython
        widget
        */
        var self = this;
        this.c = canvas;
        this.width = this.c.width();
        this.height = this.c.height();
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.c.get(0),
            antialias: true
        });
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setSize(this.width, this.height);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 0.0001, 10000);
        this.controls = new TrackballControls(this.camera, this.c.get(0));
        this.controls.rotateSpeed = 10.0;
        this.controls.zoomSpeed = 5.0;
        this.controls.panSpeed = 0.5;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
        this.controls.keys = [65, 83, 68];
        this.controls.addEventListener('change', this.render.bind(this));
    };

    AtomicThreeJS.prototype.resize = function() {
        /*"""
        Resize
        ``````````````
        Allows for the renderer to be resized on canvas resize
        */
        this.width = this.c.width();
        this.height = this.c.height();
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.controls.handleResize();
        this.render();
    };

    AtomicThreeJS.prototype.render = function() {
        /*"""
        Render the Three.js Scene
        ```````````````````````````
        */
        this.renderer.render(this.scene, this.camera);
    };

    AtomicThreeJS.prototype.add_points = function(x, y, z, r, c, filled) {
        /*"""
        Add GL Points
        ````````````````````
        */
        var material = new THREE.ShaderMaterial({
            vertexShader: vertex_shader,
            fragmentShader: point_frag_shader,
            transparent: false
        });
        if (filled == true) {
            material = new THREE.ShaderMaterial({
                vertexShader: vertex_shader,
                fragmentShader: circle_frag_shader,
                transparent: false
            });
        };
        var geometry = new THREE.BufferGeometry();
        var color = new THREE.Color();
        var n = x.length;
        var positions = new Float32Array(n * 3);
        var colors = new Float32Array(n * 3);
        var radius = new Float32Array(n);
        for (var i = 0, i3 = 0; i < n; i++, i3 += 3) {
            positions[i3 + 0] = x[i];
            positions[i3 + 1] = y[i];
            positions[i3 + 2] = z[i];
            color.setHex(c[i]);
            colors[i3 + 0] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            sizes[i] = r[i];
        };
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.scene.remove(this.points);
        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
    };

    return AtomicThreeJS;
});
