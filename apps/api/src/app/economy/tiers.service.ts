import { Injectable } from '@nestjs/common';
import { getAvailableTiers } from '../lib/tier-utils';

@Injectable()
export class TiersService {
  async findAll() {
    return getAvailableTiers();
  }
}
