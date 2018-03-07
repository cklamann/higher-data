import { getInflationAdjuster } from '../../modules/InflationAdjuster.service';
import assert = require('assert');
import chai = require('chai');
import { expect } from 'chai';
import * as _ from 'lodash';
const app = require('../../app');

describe('InflationAdjuster', function() {

	describe('adjust for inflation', function() {
		let year = '2002';
		let value = 9;
		it('should adjust the values for inflation', function(done) {
			getInflationAdjuster().then(adjuster => {
				expect(adjuster(year, value)).to.be.greaterThan(10).and.lessThan(20);
				done();
			}).catch(err => done(err));
		});
	});

});