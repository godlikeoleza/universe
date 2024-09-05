// quadtree.js
export class Quadtree {
    constructor(level, bounds) {
        this.maxObjects = 10;
        this.maxLevels = 5;
        this.level = level;
        this.bounds = bounds;
        this.objects = [];
        this.nodes = [];
    }

    clear() {
        this.objects = [];
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
                this.nodes[i] = null;
            }
        }
        this.nodes = [];
    }

    split() {
        let subWidth = this.bounds.width / 2;
        let subHeight = this.bounds.height / 2;
        let x = this.bounds.x;
        let y = this.bounds.y;

        this.nodes[0] = new Quadtree(this.level + 1, {
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        });
        this.nodes[1] = new Quadtree(this.level + 1, {
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        });
        this.nodes[2] = new Quadtree(this.level + 1, {
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        });
        this.nodes[3] = new Quadtree(this.level + 1, {
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        });
    }

    getIndex(pRect) {
        let index = -1;
        let verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        let horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

        let topQuadrant = (pRect.y < horizontalMidpoint && pRect.y + pRect.height < horizontalMidpoint);
        let bottomQuadrant = (pRect.y > horizontalMidpoint);

        if (pRect.x < verticalMidpoint && pRect.x + pRect.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            }
            else if (bottomQuadrant) {
                index = 2;
            }
        }
        else if (pRect.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            }
            else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    }

    insert(pRect) {
        if (this.nodes.length) {
            let index = this.getIndex(pRect);

            if (index !== -1) {
                this.nodes[index].insert(pRect);
                return;
            }
        }

        this.objects.push(pRect);

        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.nodes.length === 0) {
                this.split();
            }

            let i = 0;
            while (i < this.objects.length) {
                let index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                }
                else {
                    i++;
                }
            }
        }
    }

    retrieve(pRect) {
        let index = this.getIndex(pRect);
        let returnObjects = this.objects;

        if (this.nodes.length) {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.nodes[index].retrieve(pRect));
            } else {
                for (let i = 0; i < this.nodes.length; i++) {
                    returnObjects = returnObjects.concat(this.nodes[i].retrieve(pRect));
                }
            }
        }

        return returnObjects;
    }
}