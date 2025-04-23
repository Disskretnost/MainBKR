export default function getGridClass(count) {
    if (count <= 4) {
      return `grid-${count}`;
    }
    return 'grid-many';
  }