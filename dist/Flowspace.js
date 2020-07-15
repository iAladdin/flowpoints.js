"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Flowpoint = require("./Flowpoint.js");

var _Flowpoint2 = _interopRequireDefault(_Flowpoint);

var _Helpers = require("./Helpers.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Component class
var Flowspace = function (_Component) {
  _inherits(Flowspace, _Component);

  function Flowspace(props) {
    _classCallCheck(this, Flowspace);

    var _this = _possibleConstructorReturn(this, (Flowspace.__proto__ || Object.getPrototypeOf(Flowspace)).call(this, props));

    _this.state = {};

    // Helper variables
    _this.didMount = false; // Used to determine when drawing of connections should start

    // Binding class methods
    _this.updateFlowspace = _this.updateFlowspace.bind(_this);
    _this.handleFlowspaceClick = _this.handleFlowspaceClick.bind(_this);
    return _this;
  }

  _createClass(Flowspace, [{
    key: "updateFlowspace",
    value: function updateFlowspace(key, pos) {
      this.setState(_defineProperty({}, key, pos));
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.didMount = true;
    }
  }, {
    key: "handleFlowspaceClick",
    value: function handleFlowspaceClick(e) {
      // Testing click if this.props.onClick is defined
      if (this.props.onClick) {
        // Testing helper variable
        var isSpaceClick = false;

        // Testing click target (don't fire if flowpoint or connection was clicked)
        if (e.target) {
          var test = ["flowcontainer", "flowspace", "flowconnections"];
          if (test.includes(e.target.className.baseVal)) isSpaceClick = true;
          if (test.includes(e.target.className)) isSpaceClick = true;
        }

        // Potentially triggering user-defined onClick
        if (isSpaceClick) {
          this.props.onClick(e);
          e.stopPropagation();
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      // Colors
      var theme_colors = (0, _Helpers.getColor)(this.props.theme || "indigo");
      var background_color = (0, _Helpers.getColor)(this.props.background || "white");
      var selected = this.props.selected ? Array.isArray(this.props.selected) ? this.props.selected : [this.props.selected] : [];

      // Helper variables
      var connections = [];
      var paths = [];
      var gradients = [];
      var defs = {};
      var maxX = 0;
      var maxY = 0;

      // Extracting connections and adding updateFlowspace to all children
      var newKeys = [];
      var childrenWithProps = _react2.default.Children.map(this.props.children, function (child) {
        if (child.type === _Flowpoint2.default) {
          var outputs = child.props.outputs;

          // Outputs can be defined as array or object
          if (outputs instanceof Array) {
            outputs.map(function (out_key) {
              connections.push({
                a: child.key,
                b: out_key,
                width: _this2.props.connectionSize || 4,
                outputLoc: "auto",
                inputLoc: "auto",
                outputColor: theme_colors.p,
                inputColor: _this2.props.noFade ? theme_colors.p : theme_colors.a,
                dash: undefined,
                onClick: null
              });
            });
          } else if (outputs instanceof Object) {
            Object.keys(outputs).map(function (out_key) {
              var output = outputs[out_key];
              connections.push({
                a: child.key,
                b: out_key,
                width: output.width || _this2.props.connectionSize || 4,
                outputLoc: output.output || "auto",
                inputLoc: output.input || "auto",
                outputColor: output.outputColor || theme_colors.p,
                inputColor: output.inputColor || (_this2.props.noFade ? theme_colors.p : theme_colors.a),
                arrowStart: output.arrowStart,
                arrowEnd: output.arrowEnd,
                dash: output.dash !== undefined ? output.dash > 0 ? output.dash : undefined : undefined,
                onClick: output.onClick ? function (e) {
                  output.onClick(child.key, out_key, e);
                } : _this2.props.onLineClick ? function (e) {
                  _this2.props.onLineClick(child.key, out_key, e);
                } : null
              });
            });
          }

          // Adding to newKeys
          newKeys.push(child.key);

          // Returning updated child element
          return _react2.default.cloneElement(child, {
            updateFlowspace: _this2.updateFlowspace,
            id: child.key,
            selected: child.props.selected || selected.includes(child.key),
            spaceColor: background_color,
            variant: child.props.variant || _this2.props.variant || "paper",
            theme: child.props.theme || _this2.props.theme || "indigo"
          });
        }
      });

      // Removing unused positions
      Object.keys(this.state).map(function (testkey) {
        if (!newKeys.includes(testkey)) delete _this2.state[testkey];
      });

      // Drawing of connections will only start after Flowspace have been mounted once.
      if (this.didMount) {
        // Getting flowspace size
        Object.keys(this.state).map(function (key) {
          var point = _this2.state[key];
          maxX = Math.max(maxX, point.x + 4 * point.width);
          maxY = Math.max(maxY, point.y + 4 * point.height);
        });

        // Looping through connections and adding paths and gradients.
        var newCons = [];
        connections.map(function (connection, index) {
          // Loop specifics
          var pa = _this2.state[connection.a];
          var pb = _this2.state[connection.b];
          var con_key = connection.a + "_" + connection.b;

          var grad_name = "grad_" + con_key;

          // Adding to this cycle's connections
          newCons.push(con_key);

          // Continuing only if both pa and pb are defined
          if (pa && pb) {
            // Calculate new positions or get old ones
            var positions = (0, _Helpers.AutoGetLoc)(pa, pb, connection.outputLoc, connection.inputLoc, connection.a, connection.b, _this2.state, _this2.props.avoidCollisions === false ? false : true);

            // Display arrows - if set then connection-specific overrides flowspace
            var markerStart = _this2.props.arrowStart;
            if (connection.arrowStart !== undefined) markerStart = connection.arrowStart;
            var markerEnd = _this2.props.arrowEnd;
            if (connection.arrowEnd !== undefined) markerEnd = connection.arrowEnd;

            // Adding coloured arrow-marker definitions to list (if not already present)
            if (markerStart && !defs[connection.outputColor]) defs[connection.outputColor] = _react2.default.createElement(
              "marker",
              {
                key: "arrow" + index,
                id: "arrow" + connection.outputColor,
                viewBox: "0 0 50 50",
                markerWidth: "5",
                markerHeight: "5",
                refX: "45",
                refY: "24",
                orient: "auto-start-reverse",
                markerUnits: "strokeWidth"
              },
              _react2.default.createElement("path", {
                d: "M0,0 L50,20 v8 L0,48 L6,24 Z",
                fill: connection.outputColor,
                strokeWidth: "0",
                opacity: "1"
              })
            );
            if (markerEnd && !defs[connection.inputColor]) defs[connection.inputColor] = _react2.default.createElement(
              "marker",
              {
                key: "arrow" + index,
                id: "arrow" + connection.inputColor,
                viewBox: "0 0 50 50",
                markerWidth: "5",
                markerHeight: "5",
                refX: "45",
                refY: "24",
                orient: "auto-start-reverse",
                markerUnits: "strokeWidth"
              },
              _react2.default.createElement("path", {
                d: "M0,0 L50,20 v8 L0,48 L6,24 Z",
                fill: connection.inputColor,
                strokeWidth: "0",
                opacity: "1"
              })
            );

            // Calculating bezier offsets and adding new path to list
            var d = Math.round(Math.pow(Math.pow(positions.output.x - positions.input.x, 2) + Math.pow(positions.output.y - positions.input.y, 2), 0.5) / 2);
            var pathkey = "path_" + connection.a + "_" + connection.b;
            var isSelectedLine = false;
            if (_this2.props.selectedLine) {
              if (_this2.props.selectedLine.a === connection.a && _this2.props.selectedLine.b === connection.b) isSelectedLine = true;
            }
            paths.push(_react2.default.createElement("path", {
              key: pathkey,
              className: "flowconnection",
              style: {
                transition: "stroke-width 0.15s ease-in-out",
                strokeDasharray: connection.dash
              },
              d: "M" + positions.output.x + "," + positions.output.y + "C" + (positions.output.x + (positions.output.offsetX > 0 ? Math.min(d, positions.output.offsetX) : Math.max(-d, positions.output.offsetX))) + "," + (positions.output.y + (positions.output.offsetY > 0 ? Math.min(d, positions.output.offsetY) : Math.max(-d, positions.output.offsetY))) + " " + (positions.input.x + (positions.input.offsetX > 0 ? Math.min(d, positions.input.offsetX) : Math.max(-d, positions.input.offsetX))) + "," + (positions.input.y + (positions.input.offsetY > 0 ? Math.min(d, positions.input.offsetY) : Math.max(-d, positions.input.offsetY))) + " " + (positions.input.x - 0.01) + "," + (positions.input.y - 0.01),
              fill: "none",
              stroke: "url(#" + grad_name + ")",
              strokeWidth: parseInt(connection.width) + (isSelectedLine ? 3 : 0),
              onClick: connection.onClick,
              markerStart: markerStart ? "url(#arrow" + connection.outputColor + ")" : null,
              markerEnd: markerEnd ? "url(#arrow" + connection.inputColor + ")" : null
            }));

            // Calculating how x and y should affect gradient
            var p1 = { x: 0, y: 0 };
            var p2 = { x: 0, y: 0 };
            var maxD = Math.max(Math.abs(positions.output.x - positions.input.x), Math.abs(positions.output.y - positions.input.y)) + 1e-5;
            if (Math.abs(positions.output.x - positions.input.x) > Math.abs(positions.output.y - positions.input.y)) {
              if (positions.output.x > positions.input.x) {
                p1.x = maxD;
              } else {
                p2.x = maxD;
              }
            } else {
              if (positions.output.y > positions.input.y) {
                p1.y = maxD;
              } else {
                p2.y = maxD;
              }
            }
            p1.x /= maxD;
            p1.y /= maxD;
            p2.x /= maxD;
            p2.y /= maxD;

            // Adding gradient to list
            gradients.push(_react2.default.createElement(
              "linearGradient",
              {
                key: grad_name,
                id: grad_name,
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y
              },
              _react2.default.createElement("stop", { offset: "0", stopColor: connection.outputColor }),
              _react2.default.createElement("stop", { offset: "1", stopColor: connection.inputColor })
            ));
          }
        });
      }

      // Adding scroll (settings for overflow will be overwritten if defined by user)
      var style = {
        overflow: "scroll",
        backgroundColor: background_color.p
      };
      if (this.props.style) {
        Object.keys(this.props.style).map(function (propkey) {
          style[propkey] = _this2.props.style[propkey];
        });
      }

      // Returning finished Flowspace
      return _react2.default.createElement(
        "div",
        {
          style: style,
          onClick: this.handleFlowspaceClick,
          className: "flowcontainer"
        },
        _react2.default.createElement(
          "div",
          {
            style: {
              width: maxX,
              height: maxY,
              position: "relative",
              overflow: "visible"
            },
            className: "flowspace"
          },
          _react2.default.createElement(
            "div",
            {
              ref: function ref(_ref) {
                if (_this2.props.getDiagramRef) _this2.props.getDiagramRef(_ref);
              },
              style: {
                width: "100%",
                height: "100%",
                backgroundColor: background_color.p
              }
            },
            _react2.default.createElement(
              "svg",
              {
                style: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  overflow: "visible"
                },
                className: "flowconnections"
              },
              _react2.default.createElement(
                "defs",
                null,
                Object.values(defs)
              ),
              gradients,
              paths
            ),
            childrenWithProps
          )
        )
      );
    }
  }]);

  return Flowspace;
}(_react.Component);

exports.default = Flowspace;