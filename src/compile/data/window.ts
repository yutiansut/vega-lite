import {AggregateOp} from '../../aggregate';
import {WindowFieldDef, WindowTransform} from '../../transform';
import {duplicate} from '../../util';
import {VgComparator, VgComparatorOrder, VgWindowTransform} from '../../vega.schema';
import {WindowOnlyOp} from '../../window';
import {DataFlowNode} from './dataflow';

/**
 * A class for the window transform nodes
 */
export class WindowTransformNode extends DataFlowNode {
  public clone(): WindowTransformNode {
      return new WindowTransformNode(duplicate(this.transform));
  }

  constructor(private transform: WindowTransform) {
    super();
  }

  public producedFields() {
    const out = {};
    this.transform.window.forEach(element => {
      out[element.as] = true;
    });

    return out;
  }

  public assemble(): VgWindowTransform {
    const fields: string[] = [];
    const ops: (AggregateOp | WindowOnlyOp)[] = [];
    const as = [];
    const params = [];
    for (const window of this.transform.window) {
      ops.push(window.op === undefined ? null : window.op);
      as.push(window.as === undefined ? null : window.as);
      params.push(window.param === undefined ? null : window.param);
      fields.push(window.field === undefined ? null : window.field);
    }

    const frame = this.transform.frame;
    const groupby = this.transform.groupby;
    const sortFields: string[] = [];
    const sortOrder: VgComparatorOrder[] = [];
    if (this.transform.sort !== undefined) {
      for (const compField of this.transform.sort.compare) {
        sortFields.push(compField.field);
        sortOrder.push(compField.order === undefined ? null : compField.order as VgComparatorOrder);
      }
    }
    const sort: VgComparator = {
      field: sortFields,
      order: sortOrder,
    };
    const ignorePeers = this.transform.ignorePeers;

    const result: VgWindowTransform = {
      type: 'window',
      params,
      as,
      ops,
      fields,
      sort,
    };

    if (ignorePeers !== undefined) {
      result.ignorePeers = ignorePeers;
    }

    if (fields !== undefined) {
      result.fields = fields;
    }

    if (groupby !== undefined) {
      result.groupby = groupby;
    }

    if (frame !== undefined) {
      result.frame = frame;
    }

    return result;
  }
}
