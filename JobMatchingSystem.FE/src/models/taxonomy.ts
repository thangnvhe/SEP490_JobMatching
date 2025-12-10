export interface Taxonomy {
  id: number;
  name: string;
  parentId?: number | null;
  childrenIds?: number[];
  hasChildren?: boolean;
}

export interface TaxonomyTreeNode extends Taxonomy {
  level: number;
  isExpanded: boolean;
  isLoading: boolean;
  children?: TaxonomyTreeNode[];
  hierarchyIndex: string;
}
