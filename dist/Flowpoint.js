'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Helpers = require('./Helpers.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Component class
var Flowpoint = function (_Component) {
  _inherits(Flowpoint, _Component);

  function Flowpoint(props) {
    _classCallCheck(this, Flowpoint);

    var _this = _possibleConstructorReturn(this, (Flowpoint.__proto__ || Object.getPrototypeOf(Flowpoint)).call(this, props));

    _this.state = {

      // Helpers
      id: props.id,

      // Snap to grid
      snap: props.snap === undefined ? { x: 1, y: 1 } : props.snap,

      // Enable drag along axes
      dragX: props.dragX === undefined ? true : props.dragX,
      dragY: props.dragY === undefined ? true : props.dragY,

      // Position limits
      minX: props.minX === undefined ? 0 : props.minX,
      minY: props.minY === undefined ? 0 : props.minY,

      // Sizes
      width: props.width === undefined ? 150 : props.width,
      height: props.height === undefined ? 50 : props.height,

      // Currently dragging
      drag: false,

      // Position and relative position
      pos: props.startPosition === undefined ? { x: 0, y: 0 } : props.startPosition,
      rel: { x: 0, y: 0 }

    };

    // Helper variables
    _this.didDrag = false;
    _this.doTellFlowspace = false;

    // User defined event handlers
    _this.onClick = props.onClick;
    _this.onTouch = props.onTouch;
    _this.onDrag = props.onDrag;
    _this.onHover = props.onHover;

    // Refered methods
    _this.updateFlowspace = props.updateFlowspace;

    // Binding helper methods
    _this.tellFlowspace = _this.tellFlowspace.bind(_this);

    // Binding event handlers
    _this.onMouseOver = _this.onMouseOver.bind(_this);
    _this.onMouseOut = _this.onMouseOut.bind(_this);
    _this.onMouseDown = _this.onMouseDown.bind(_this);
    _this.onMouseUp = _this.onMouseUp.bind(_this);
    _this.onMouseMove = _this.onMouseMove.bind(_this);
    _this.onTouchStart = _this.onTouchStart.bind(_this);
    _this.onTouchEnd = _this.onTouchEnd.bind(_this);
    _this.onTouchMove = _this.onTouchMove.bind(_this);

    return _this;
  }

  _createClass(Flowpoint, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.tellFlowspace(); // Flowspace won't draw connections before this have been called
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      var _this2 = this;

      var testkeys = ['width', 'height'];
      testkeys.map(function (propkey) {
        if (propkey in props) {
          if (props[propkey] !== _this2.state[propkey]) {
            _this2.state[propkey] = props[propkey];
            _this2.doTellFlowspace = true;
          }
        }
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(props, state) {

      // Telling flowspace about changes?
      if (this.doTellFlowspace) {
        this.tellFlowspace();
        this.doTellFlowspace = false;
      }

      // Adding/removing event listeners
      if (this.state.drag && !state.drag) {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('touchmove', this.onTouchMove);
        document.addEventListener('touchend', this.onTouchEnd);
      } else if (!this.state.drag && state.drag) {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('touchmove', this.onTouchMove);
        document.removeEventListener('touchend', this.onTouchEnd);
      }
    }
  }, {
    key: 'tellFlowspace',
    value: function tellFlowspace() {

      // Telling parent flowspace about new positions and/or dimensions
      this.updateFlowspace(this.state.id, {
        x: this.state.pos.x,
        y: this.state.pos.y,
        width: this.state.width,
        height: this.state.height
      });

      // Prevent another tell on componentDidUpdate
      this.doTellFlowspace = false;
    }
  }, {
    key: 'onTouchStart',
    value: function onTouchStart(e) {

      // No dragging?
      if (e.target.className.includes('nodrag')) return;

      // Resetting drag
      this.didDrag = false;

      // Updating state
      this.setState({
        drag: true,
        rel: {
          x: e.touches[0].pageX - this.state.pos.x,
          y: e.touches[0].pageY - this.state.pos.y
        }
      });

      // Final routines
      e.preventDefault();
      e.stopPropagation();
    }
  }, {
    key: 'onTouchEnd',
    value: function onTouchEnd(e) {

      // Trigger user-defined onClick?
      if (!this.didDrag) {
        this.onTouch(e);
      } else {
        // Updating flowspace
        this.tellFlowspace();
      }

      // Resetting drag
      this.setState({ drag: false });

      // Final routines
      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'onTouchMove',
    value: function onTouchMove(e) {

      // No dragging?
      if (!this.state.drag) return;

      // Flowpoint was moved
      this.didDrag = true;

      // Calculating new position
      var pos = {
        x: this.state.dragX ? (0, _Helpers.CalcPos)(e.touches[0].pageX - this.state.rel.x, this.state.snap.x, this.state.minX) : this.state.pos.x,
        y: this.state.dragY ? (0, _Helpers.CalcPos)(e.touches[0].pageY - this.state.rel.y, this.state.snap.y, this.state.minY) : this.state.pos.y
      };
      this.setState({ pos: pos });

      // Passing to user-defined event handler
      if (this.onDrag) this.onDrag(pos);

      // Updating flowspace
      this.tellFlowspace();

      // Final routines
      e.preventDefault();
      e.stopPropagation();
    }
  }, {
    key: 'onMouseOver',
    value: function onMouseOver(e) {
      // Trigger user-defined event?
      if (this.onHover) {
        this.onHover(true);
      }
    }
  }, {
    key: 'onMouseOut',
    value: function onMouseOut(e) {
      // Trigger user-defined event?
      if (this.onHover) {
        this.onHover(false);
      }
    }
  }, {
    key: 'onMouseDown',
    value: function onMouseDown(e) {

      // Wrong button or nodrag will cancel click and drag events
      if (e.button !== 0) return;
      if (e.target.className.includes('nodrag')) return;

      // Resetting dragging (just to be sure)
      this.didDrag = false;

      // Updating state
      this.setState({
        drag: true,
        rel: {
          x: e.pageX - this.state.pos.x,
          y: e.pageY - this.state.pos.y
        }
      });

      // Final routines
      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'onMouseUp',
    value: function onMouseUp(e) {

      // Trigger user-defined onClick?
      if (!this.didDrag) this.onClick(e);

      // Resetting drag
      this.setState({ drag: false });

      // Updating flowspace
      this.tellFlowspace();

      // Final routines
      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'onMouseMove',
    value: function onMouseMove(e) {

      // No dragging?
      if (!this.state.drag) return;

      // Flowpoint was moved
      this.didDrag = true;

      // Calculating new position
      var pos = {
        x: this.state.dragX ? (0, _Helpers.CalcPos)(e.pageX - this.state.rel.x, this.state.snap.x, this.state.minX) : this.state.pos.x,
        y: this.state.dragY ? (0, _Helpers.CalcPos)(e.pageY - this.state.rel.y, this.state.snap.y, this.state.minY) : this.state.pos.y
      };
      this.setState({ pos: pos });

      // Passing to user-defined event handler
      if (this.onDrag) this.onDrag(pos);

      // Updating flowspace
      this.tellFlowspace();

      // Final routines
      e.stopPropagation();
      e.preventDefault();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      // Colors
      var c = (0, _Helpers.getColor)(this.props.theme);

      // Prepping default style (and adds updated position)
      var style = {
        width: this.props.width || this.state.width,
        height: this.props.height || this.state.height,
        left: this.state.pos.x + 'px',
        top: this.state.pos.y + 'px',
        position: 'absolute',
        transition: ['border-color 0.4s ease-out', 'background-color 0.4s ease-out'],
        backgroundColor: this.props.spaceColor.p,
        color: this.props.spaceColor.t === 'light' ? '#ffffff' : '#000000',
        boxShadow: null,
        borderColor: null,
        borderStyle: null,
        borderWidth: null,
        borderRadius: null,
        fontWeight: null

        // Paper?
      };if (this.props.variant === 'paper') {
        style.boxShadow = this.props.selected ? '2px 2px 3px rgba(0,0,0,0.12), 0 3px 3px rgba(0,0,0,0.24)' : '2px 2px 3px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.24)';
      }

      // Outlined?
      if (this.props.variant === 'outlined') {
        style.borderColor = this.props.selected ? c.o : c.p;
        style.borderStyle = 'solid';
        style.borderWidth = '1px';
        style.borderRadius = '5px';
      }

      // Filled?
      if (this.props.variant === 'filled') {
        style.backgroundColor = this.props.selected ? c.s : c.p;
        style.color = c.t === 'light' ? '#ffffff' : '#000000';
        style.borderColor = style.backgroundColor;
        style.borderStyle = 'solid';
        style.borderWidth = '1px';
        style.borderRadius = '5px';
        style.fontWeight = 500;
      }

      // Adding user defined styles
      if (this.props.style) {
        Object.keys(this.props.style).map(function (key) {
          return style[key] = _this3.props.style[key];
        });
      }

      // Returning finished Flowpoint
      return _react2.default.createElement(
        'div',
        {
          className: 'flowpoint',
          key: this.state.id,
          style: style,
          onMouseOver: this.onMouseOver,
          onMouseOut: this.onMouseOut,
          onMouseDown: function onMouseDown(e) {
            _this3.onMouseDown(e);
          },
          onTouchStart: function onTouchStart(e) {
            _this3.onTouchStart(e);
          },
          onClick: function onClick(e) {
            _this3.onMouseUp(e);
          } },
        this.props.children
      );
    }
  }]);

  return Flowpoint;
}(_react.Component);

exports.default = Flowpoint;