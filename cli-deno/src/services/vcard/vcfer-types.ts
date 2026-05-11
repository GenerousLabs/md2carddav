export type VcferProp = {
  getValue(): string;
  params: Record<string, unknown>;
};

export type VcferInst = {
  props: Map<string, VcferProp[]>;
  get(field: string): VcferProp[];
  getOne(field: string): VcferProp | undefined;
};
